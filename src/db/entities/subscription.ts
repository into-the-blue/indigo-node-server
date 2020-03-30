import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm'
import { TSubCondition } from '@/types'
@Entity({ name: 'subscriptions' })
export class Subscription {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @Column({
    type: 'array',
  })
  coordinates: [number, number]

  @ObjectIdColumn({ name: 'user_id' })
  userId: ObjectID

  @Column({ type: 'int' })
  radius: number

  @Column({ type: 'array' })
  conditions: TSubCondition[]

  @Column({ type: 'string' })
  type: 'metroStation' | 'customLocation'

  @Column()
  payload: object

  @Column()
  city: string

  @Column({ type: 'date', name: 'created_at' })
  createdAt: Date

  @Column({ type: 'date', name: 'updated_at' })
  updatedAt: Date
}