import { Entity, ObjectID, Column, ObjectIdColumn } from 'typeorm'

@Entity({ name: 'lines' })
export class LineEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @Column({ name: 'line_id', unique: true, type: 'string' })
  lineId: string

  @Column({ name: 'line_name' })
  lineName: string

  @Column()
  url: string

  @Column()
  city: string
}
