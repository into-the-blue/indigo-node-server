import { Entity, ObjectIdColumn, ObjectID, Column, Index, In } from 'typeorm';

@Entity({ name: 'apartments' })
export class ApartmentEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID;

  @Column({ type: 'string' })
  type: string;

  @Column({ type: 'string' })
  title: string;

  @Column({ name: 'created_at', type: 'string' })
  createdAt: string;

  @Column({ name: 'house_code', type: 'string' })
  houseCode: string;

  @Column({ name: 'house_id', type: 'string' })
  houseId: string;

  @Column({ name: 'city_abbreviation', type: 'string' })
  cityAbbreviation: string;

  @Column({ name: 'img_urls', type: 'array' })
  imgUrls: string[];

  @Column({ name: 'price', type: 'int' })
  price: number;

  @Column({ name: 'tags', type: 'array' })
  tags: string[];

  @Column({ name: 'house_type', type: 'string', nullable: true })
  houseType: string;

  @Column({ name: 'area', type: 'int', nullable: true })
  area: number;

  @Column({ name: 'orient', type: 'string' })
  orient: string;

  @Column({ type: 'string' })
  coordtype: string;

  @Column({ type: 'string' })
  lease: string;

  @Column({ type: 'string' })
  floor: string;

  @Column({ name: 'building_total_floors', type: 'int' })
  buildingTotalFloors: number;

  @Column({ type: 'string' })
  carport: string;

  @Column({ type: 'string' })
  electricity: string;

  @Column({ name: 'check_in_date', type: 'string' })
  checkInDate: string;

  @Column({ type: 'string' })
  elevator: string;

  @Column({ type: 'string' })
  water: string;

  @Column({ type: 'string' })
  gas: string;

  @Column({ type: 'int' })
  television: number;

  @Column({ type: 'int' })
  fridge: number;

  @Column({ name: 'washing_machine', type: 'int' })
  washingMachine: number;

  @Column({ name: 'air_condition', type: 'int' })
  airCondition: number;

  @Column({ name: 'water_heater', type: 'int' })
  waterHeater: number;

  @Column({ type: 'int' })
  bed: number;

  @Column({ type: 'int' })
  heating: number;

  @Column({ type: 'int' })
  wifi: number;

  @Column({ type: 'int' })
  closet: number;

  @Column({ name: 'naturalGas', type: 'int' })
  naturalGas: number;

  @Column({ type: 'array' })
  transportations: object[];

  @Column({ name: 'community_deals', type: 'string' })
  communityDeals: string;

  @Column({ name: 'house_description', type: 'string' })
  houseDescription: string;

  @Column({ name: 'house_url', type: 'string' })
  houseUrl: string;

  @Column({ type: 'string' })
  city: string;

  @Column({ type: 'string' })
  district: string;

  @Column({ type: 'string' })
  bizcircle: string;

  @Column({ name: 'community_name', type: 'string' })
  communityName: string;

  @Column({ name: 'community_url', type: 'string' })
  communityUrl: string;

  @Column({ name: 'price_per_square_meter', type: 'double' })
  pricePerSquareMeter: number;

  @Column({ name: 'floor_full_info', type: 'string' })
  floorFullInfo: string;
  // @Column({ name: 'broker_brand' })
  // brokerBrand: string

  @Column({ name: 'floor_accessibility', type: 'int' })
  floorAccessibility: number;

  @Column({ name: 'subway_accessibility', type: 'int' })
  subwayAccessibility: number;

  // @Column({ name: 'image_downloaded', type: 'boolean' })
  // imageDownloaded: boolean

  @Column({ type: 'int', nullable: true })
  notified: number;

  @Column({ name: 'geo_info' })
  geoInfo: object;

  @Column({ type: 'double' })
  lat: number;

  @Column({ type: 'double' })
  lng: number;

  @Column({ type: 'array' })
  coordinates: [number, number];

  @Column({ name: 'line_ids', type: 'array' })
  lineIds: string[];

  @Column({ name: 'station_ids', type: 'array' })
  stationIds: string[];

  @Column({ name: 'created_time', type: 'date' })
  createdTime: Date;

  @Column({ name: 'updated_time', type: 'date' })
  updatedTime: Date;

  @Column({ name: 'notification_sent' })
  notificationSent: boolean;

  @Column({ nullable: true })
  computed: object;
}
