import {
  Authorized,
  JsonController,
  Get,
  QueryParams,
  Ctx,
  QueryParam,
  InternalServerError,
} from 'routing-controllers'

import { response, RESP_CODES, toCamelCase } from '@/utils'
import { GeographicClient } from '@/services/geographic'
import { CustomLocationModel } from '../model/customLocation'
import { Context } from 'koa'
import { IsString, IsNumber } from 'class-validator'

class GetLocationQueryParams {
  @IsString()
  address: string
  @IsString()
  city: string
  @IsNumber()
  lng: number
  @IsNumber()
  lat: number
  @IsString()
  name: string
  @IsString()
  district: string
}

@Authorized()
@JsonController()
export class LocationController {
  @Get('/location/search')
  async searchLocation(@QueryParams() query: any) {
    const { search, city } = query
    if (!search || !city) return response(RESP_CODES.INVALID_INPUTS)
    const result = await GeographicClient.searchPOI(search, city)
    return response(RESP_CODES.OK, undefined, result)
  }

  @Get('/location/poi')
  async createOrGetLocation(
    @QueryParams()
    query: GetLocationQueryParams
  ) {
    const { address, city, lng, lat, name, district } = query
    try {
      const coordinates: [number, number] = [+lng, +lat]
      const existing = await CustomLocationModel.findCustomLocation(coordinates)
      if (existing)
        return response(RESP_CODES.OK, undefined, toCamelCase(existing))
      const geoInfo = await GeographicClient.decodeAddressAmap(
        address + name,
        city
      )
      const id = await CustomLocationModel.insertCustomLocationPOI({
        geoInfo,
        address,
        city,
        coordinates,
        name,
        district,
      })
      return response(RESP_CODES.OK, undefined, {
        id: id.toString(),
        address,
        city,
        coordinates,
        popularity: 0,
      })
    } catch (err) {
      console.warn(err)
      throw new InternalServerError(err.message)
    }
  }

  @Get('/location/address')
  async decodeAddress(@QueryParams() query: any) {
    const { address, city } = query
    if (!address || !city) return response(RESP_CODES.INVALID_INPUTS)
    const geoInfo = await GeographicClient.decodeAddressAmap(address, city)
    if (!+geoInfo.count) return response(RESP_CODES.NOT_FOUND)
  }
}
