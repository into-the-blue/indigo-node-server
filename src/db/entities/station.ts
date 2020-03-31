import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm'

@Entity({ name: 'stations' })
export class StationEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @Column({ name: 'station_id', type: 'string' })
  stationId: string

  @Column({ name: 'line_id', type: 'string' })
  lineId: string

  @Column({ name: 'station_name' })
  stationName: string

  @Column()
  url: string

  @Column({ type: 'array' })
  coordinates: number[]

  @Column({ name: 'line_ids', type: 'array' })
  lineIds: string[]

  @Column({ type: 'array' })
  urls: string[]

  @Column()
  city: string
}
