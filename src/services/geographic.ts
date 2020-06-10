// import {} from '@/utils'
import Axios from 'axios';
import { IGeoInfoAMap, IPOI, IDecodedCoordinates } from '@/types';
import { get } from 'lodash';
const AMAP_API_URL = 'https://restapi.amap.com/v3/geocode/geo?parameters';
const AMAP_AK = process.env.AMAP_ACCESS_KEY;

export class GeographicClient {
  /**
  *
  *
  * @param {string} address
  * @param {string} [city]
  * 
  *  https://lbs.amap.com/api/webservice/guide/api/georegeo/?sug_index=3
     {'status': '1',
      'info': 'OK',
      'infocode': '10000',
      'count': '1',
      'geocodes': [{'formatted_address': '上海市长宁区虹桥路地铁站',
        'country': '中国',
        'province': '上海市',
        'citycode': '021',
        'city': '上海市',
        'district': '长宁区',
        'township': [],
        'neighborhood': {'name': [], 'type': []},
        'building': {'name': [], 'type': []},
        'adcode': '310105',
        'street': [],
        'number': [],
        'location': '121.420814,31.197524',
        'level': '兴趣点'}]}
  */
  static decodeAddressAmap = async (
    address: string,
    city?: string
  ): Promise<IGeoInfoAMap> => {
    const { data } = await Axios.get(AMAP_API_URL, {
      params: {
        address: address,
        key: AMAP_AK,
        city: city,
        output: 'json',
      },
    });
    return data;
  };

  /**
   *
   *
   * @static
   * @memberof GeographicClient
   * https://lbs.amap.com/api/webservice/guide/api/search
   */
  static searchPOI = async (
    keywords: string,
    city?: string
  ): Promise<IPOI[]> => {
    const { data } = await Axios.get('https://restapi.amap.com/v3/place/text', {
      params: {
        key: AMAP_AK,
        keywords,
        city,
        citylimit: true,
      },
    });
    return mapPoiData(data);
  };

  static decodeCoordinates = async (
    coordinates: [number, number]
  ): Promise<null | IDecodedCoordinates> => {
    const { data } = await Axios.get(
      'https://restapi.amap.com/v3/geocode/regeo',
      {
        params: {
          key: AMAP_AK,
          location: coordinates.join(','),
        },
      }
    );
    if (typeof get(data, 'regeocode.addressComponent.city') !== 'string') return null;
    return data;
  };
}

const mapPoiData = (data: any): IPOI[] => {
  return data.pois.map((item) => ({
    name: item.name,
    type: item.type,
    typeCode: item.typecode,
    address: item.address,
    location: item.location,
    coordinates: item.location.split(',').map((o) => +o),
    city: item.cityname,
    district: item.adname,
  }));
};
