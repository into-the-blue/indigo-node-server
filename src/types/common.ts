type Missing1<T> = '暂无数据' | T

type ApartmentRentType = '整租' | '合租'
type CityAbbreviation = 'sh'
type ApartmentTags =
  | '押一付一'
  | '随时看房'
  | '近地铁'
  | '独立卫生间'
  | '月租'
  | '新上'
  | '公寓'
  | '精装'
  | '双卫生间'
  | '租住保障'
  | '独立阳台'

type ApartmentLease = Missing1<string>

type ApartmentElectricityType = '商电' | '民电'

type ApartmentWaterType = Missing1<'商水' | '民水'>

type Carport = Missing1<'租用车位'>

type ApartmentGas = Missing1<'有' | '无'>
// [
//   "1号线 - 汶水路",
//   "534m"
// ],
// [
//   "1号线 - 上海马戏城",
//   "1188m"
// ]
type TransportationLine = string
type TransportationDistance = string
type Transportation = [TransportationLine, TransportationDistance]

type ApartmentCheckInDate = '随时入住' | string

type Facility = 0 | 1

type ApartmentElevator = Missing1<'有'>

interface IGeoInfo {
  location: {
    lat: number
    lng: number
  }
  precise: number
  comprehension: number
  confidence: number
  level: string
}
export interface IApartment {
  id: string

  type: ApartmentRentType

  title: string

  createdAt: string

  houseCode: string

  houseId: string

  cityAbbreviation: CityAbbreviation

  imgUrls: string[]

  price: number

  tags: ApartmentTags[]

  // [0-10]室[0-10]厅[0-10]卫
  houseType: string

  area: number
  //  南 / 北 / 南 北 / 南 西 北 ....etc
  orient: string

  // 1~12个月
  lease: ApartmentLease

  // '23'
  floor: string

  // 33
  buildingTotalFloors: number

  carport: Carport

  electricity: ApartmentElectricityType

  // can be a date '2020-02-10'
  checkInDate: ApartmentCheckInDate

  // 暂无数据, 有, 暂无数据 转换成 无
  elevator: ApartmentElevator

  // if 暂无数据 and 公寓 in tags: 商水
  water: ApartmentWaterType

  gas: ApartmentGas

  television: Facility

  fridge: Facility

  washingMachine: Facility

  airCondition: Facility

  waterHeater: Facility

  bed: Facility

  heating: Facility

  wifi: Facility

  closet: Facility

  naturalGas: Facility

  transportations: Transportation[]

  // empty str
  communityDeals: string
  // empty str
  houseDescription: string

  houseUrl: string
  // 上海
  city: string

  district: string

  bizcircle: string

  communityName: string

  communityUrl: string

  pricePerSquareMeter: number

  // brokerBrand: string

  floorAccessibility: Facility

  subwayAccessibility: Facility

  coordinates: number[]

  coordtype: 'gcj02' | 'amap-gcj02'

  // imageDownloaded: boolean

  geoInfo: IGeoInfo

  lat: number

  lng: number

  lineIds: string[]

  stationIds: string[]

  createdTime: Date

  updatedTime: Date
}

export interface IMetroLine {
  id: string
  lineName: string
  lineId: string
  url: string
  city: string
}

interface IMetroStationDEPRECATED {
  lineId: string
  url: string
}

export interface IMetroStationClient extends IMetroStation {
  lines: IMetroLine[]
}
export interface IMetroStation extends IMetroStationDEPRECATED {
  id: string
  stationName: string
  stationId: string
  city: string
  lineIds: string[]
  urls: string[]
  coordinates: number[]
}
