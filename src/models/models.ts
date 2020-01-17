import { VerifyErrors } from 'jsonwebtoken'

type ApartmentRentType = '整租' | '合租'
type CityAbbreviation = 'sh'
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

  tags: string[]

  houseType: string

  area: number

  orient: string

  minimalLease: string

  maximalLease: string

  floor: string

  buildingTotalFloors: string

  carport: string

  electricityType: string

  checkInDate: string

  reservation: string

  elevator: string

  water: string

  gas: string

  television: number

  fridge: number

  washingMachine: number

  airCondition: number

  waterHeater: number

  bed: number

  heating: number

  wifi: number

  closet: number

  naturalGas: number

  transportations: object[]

  communityDeals: string

  houseDescription: string

  houseUrl: string

  city: string

  district: string

  bizcircle: string

  communityName: string

  communityUrl: string

  pricePerSquareMeter: number

  brokerBrand: string

  floorAccessibility: number

  subwayAccessibility: number

  imageDownloaded: boolean

  geoInfo: object

  lat: number

  lng: number

  lineIds: number[]

  stationIds: number[]

  createdTime: Date

  updatedTime: Date
}
export interface IJwtResponse {
  success: boolean
  err?: VerifyErrors
  result?: string | object
}
