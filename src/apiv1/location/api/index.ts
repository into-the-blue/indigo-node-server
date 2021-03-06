import {
  Authorized,
  JsonController,
  Get,
  QueryParams,
  Ctx,
  QueryParam,
  InternalServerError,
} from 'routing-controllers';

import { response, RESP_CODES, toCamelCase, logger } from '@/utils';
import { GeographicClient } from '@/services/geographic';
import { CustomLocationModel } from '../model/customLocation';
import { Context } from 'koa';
import { IsString, IsNumber, IsArray } from 'class-validator';
import { AVAILABLE_CITIES } from '../utils/constants';
import { redisClient, getCached } from '@/db';
import { merge, from } from 'rxjs';
import { filter, map, tap, take } from 'rxjs/operators';

class GetLocationQueryParams {
  @IsString()
  address: string;
  @IsString()
  city: string;
  @IsArray()
  coordinates: [number, number];
  @IsString()
  name: string;
  @IsString()
  district: string;
}

@Authorized()
@JsonController()
export class LocationController {
  @Get('/location/decode_coordinates')
  async decodeCoordinates(
    @QueryParam('coordinates') coordinates: number[],
    @Ctx() ctx: Context
  ) {
    const _coordinates: [number, number] = coordinates.map((_) => +_) as any;
    const res = await GeographicClient.decodeCoordinates(_coordinates);
    return response(RESP_CODES.OK, undefined, res);
  }

  @Get('/location/available_cities')
  async availableCitys() {
    const data = await getCached(
      'api/location/available_cities',
      () =>
        CustomLocationModel.getCountOfNewApartments(AVAILABLE_CITIES as any),
      60 * 15
    );
    return response(RESP_CODES.OK, undefined, data);
  }

  @Get('/location/search')
  async searchLocation(@QueryParams() query: any) {
    const { search, city } = query;
    if (!search || !city) return response(RESP_CODES.INVALID_INPUTS);
    const result = await GeographicClient.searchPOI(search, city);
    return response(RESP_CODES.OK, undefined, result);
  }

  @Get('/location/poi')
  async createOrGetLocation(
    @QueryParams()
    query: GetLocationQueryParams
  ) {
    const { address, city, coordinates, name, district } = query;
    try {
      const _coordinates: [number, number] = coordinates.map((_) => +_) as any;
      const existing = await CustomLocationModel.findCustomLocation(
        _coordinates
      );
      if (existing)
        return response(RESP_CODES.OK, undefined, toCamelCase(existing));
      const geoInfo = await GeographicClient.decodeAddressAmap(
        address + name,
        city
      );
      const id = await CustomLocationModel.insertCustomLocationPOI({
        geoInfo,
        address,
        city,
        coordinates: _coordinates,
        name,
        district,
      });
      return response(RESP_CODES.OK, undefined, {
        id: id.toString(),
        address,
        city,
        name,
        district,
        coordinates: _coordinates,
        popularity: 0,
      });
    } catch (err) {
      logger.error('[createOrGetLocation]', err);
      throw new InternalServerError(err.message);
    }
  }

  @Get('/location/address')
  async decodeAddress(@QueryParams() query: any) {
    const { address, city } = query;
    if (!address || !city) return response(RESP_CODES.INVALID_INPUTS);
    const geoInfo = await GeographicClient.decodeAddressAmap(address, city);
    if (!+geoInfo.count) return response(RESP_CODES.NOT_FOUND);
  }
}
