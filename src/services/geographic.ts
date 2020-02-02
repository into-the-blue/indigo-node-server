// import {} from '@/utils'
import Axios from 'axios'
import { IGeoInfoAMap } from '@/types'
const AMAP_API_URL = 'https://restapi.amap.com/v3/geocode/geo?parameters'
const AMAP_AK = process.env.AMAP_ACCESS_KEY

export /**
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
const decodeAddressAmap = async (
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
  })
  return data
}
