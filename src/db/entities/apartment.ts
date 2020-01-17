import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm'

@Entity({ name: 'apartments' })
export class Apartment {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @Column()
  type: string

  @Column()
  title: string

  @Column({ name: 'created_at', type: 'string' })
  createdAt: string

  @Column({ name: 'house_code', type: 'string' })
  houseCode: string

  @Column({ name: 'house_id', type: 'string' })
  houseId: string

  @Column({ name: 'city_abbreviation', type: 'string' })
  cityAbbreviation: string

  @Column({ name: 'img_urls', type: 'array' })
  imgUrls: string[]

  @Column({ name: 'price', type: 'int' })
  price: number

  @Column({ name: 'tags', type: 'array' })
  tags: string[]

  @Column({ name: 'house_type', type: 'string', nullable: true })
  houseType: string

  @Column({ name: 'area', type: 'int', nullable: true })
  area: number

  @Column({ name: 'orient', type: 'string' })
  orient: string

  @Column({ name: 'minimal_lease', type: 'string' })
  minimalLease: string

  @Column({ name: 'maximal_lease', type: 'string' })
  maximalLease: string

  @Column()
  floor: string

  @Column({ name: 'building_total_floors' })
  buildingTotalFloors: string

  @Column()
  carport: string

  @Column({ name: 'electricity_type' })
  electricityType: string

  @Column({ name: 'check_in_date' })
  checkInDate: string

  @Column()
  reservation: string

  @Column()
  elevator: string

  @Column()
  water: string

  @Column()
  gas: string

  @Column({ type: 'int' })
  television: number

  @Column({ type: 'int' })
  fridge: number

  @Column({ name: 'washing_machine', type: 'int' })
  washingMachine: number

  @Column({ name: 'air_condition', type: 'int' })
  airCondition: number

  @Column({ name: 'water_heater', type: 'int' })
  waterHeater: number

  @Column({ type: 'int' })
  bed: number

  @Column({ type: 'int' })
  heating: number

  @Column({ type: 'int' })
  wifi: number

  @Column({ type: 'int' })
  closet: number

  @Column({ name: 'naturalGas', type: 'int' })
  naturalGas: number

  @Column({ type: 'array' })
  transportations: object[]

  @Column({ name: 'community_deals' })
  communityDeals: string

  @Column({ name: 'house_description' })
  houseDescription: string

  @Column({ name: 'house_url' })
  houseUrl: string

  @Column()
  city: string

  @Column()
  district: string

  @Column()
  bizcircle: string

  @Column({ name: 'community_name' })
  communityName: string

  @Column({ name: 'community_url' })
  communityUrl: string

  @Column({ name: 'price_per_square_meter', type: 'double' })
  pricePerSquareMeter: number

  @Column({ name: 'broker_brand' })
  brokerBrand: string

  @Column({ name: 'floor_accessibility', type: 'int' })
  floorAccessibility: number

  @Column({ name: 'subway_accessibility', type: 'int' })
  subwayAccessibility: number

  @Column({ name: 'image_downloaded', type: 'boolean' })
  imageDownloaded: boolean

  @Column({ name: 'geo_info' })
  geoInfo: object

  @Column({ type: 'double' })
  lat: number

  @Column({ type: 'double' })
  lng: number

  @Column({ name: 'line_ids', type: 'array' })
  lineIds: number[]

  @Column({ name: 'station_ids', type: 'array' })
  stationIds: number[]

  @Column({ name: 'created_time', type: 'date' })
  createdTime: Date

  @Column({ name: 'updated_time', type: 'date' })
  updatedTime: Date
}
