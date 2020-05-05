import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm'

@Entity({
  name: 'subscriptionNotificationHistorys',
})
export default class SubscriptionNotificationHistory {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @ObjectIdColumn({ name: 'user_id' })
  userId: ObjectID

  @ObjectIdColumn({ name: 'apartment_id' })
  apartmentId: ObjectID

  @Column({ type: 'boolean', default: false })
  viewed: boolean

  @ObjectIdColumn({ name: 'subscription_id' })
  subscriptionId: ObjectID

  @ObjectIdColumn({ name: 'location_id' })
  locationId: ObjectID
  //   @Column({ type: 'boolean', default: false })
  //   success: boolean

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'date' })
  updatedAt: Date
}
