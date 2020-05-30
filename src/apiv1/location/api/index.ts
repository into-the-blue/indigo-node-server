import {
  Authorized,
  JsonController,
  Get,
  QueryParams,
} from 'routing-controllers'
import { response, RESP_CODES } from '@/utils'
import { GeographicClient } from '@/services/geographic'

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

  @Get('/location/address')
  async decodeAddress(@QueryParams() query: any) {
    const { address, city } = query
    if (!address || !city) return response(RESP_CODES.INVALID_INPUTS)
    const geoInfo = await GeographicClient.decodeAddressAmap(address, city)
    if (!+geoInfo.count) return response(RESP_CODES.NOT_FOUND)
  }
}
