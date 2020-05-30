import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm'

@Entity({ name: 'customLocations' })
export class CustomLocationEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @Column({ type: 'string' })
  address: string

  @Column({ type: 'string' })
  city: string

  @Column({ type: 'array' })
  coordinates: [number, number]

  @Column({ type: 'array' })
  alias: string[]

  @Column({ type: 'int', default: 0 })
  popularity: number

  @Column({ name: 'geo_info' })
  geoInfo: object

  @Column({ type: 'date', name: 'created_at' })
  createdAt: Date

  @Column({ type: 'date', name: 'updated_at' })
  updatedAt: Date
}
