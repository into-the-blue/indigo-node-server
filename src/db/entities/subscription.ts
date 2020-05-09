import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm'
import { TSubCondition, TSubscriptionPayload } from '@/types'
@Entity({ name: 'subscriptions' })
export class SubscriptionEntity {
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
  address: string

  @Column()
  payload: TSubscriptionPayload

  @Column({ type: 'boolean', default: false })
  deleted: boolean

  @Column()
  city: string

  @Column({ type: 'date', name: 'created_at' })
  createdAt: Date

  @Column({ type: 'date', name: 'updated_at' })
  updatedAt: Date
}
