import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm'
import { TSubscriptionNotificationPriority } from '@/types'

@Entity({
  name: 'subscriptionNotificationRecords',
})
export class SubscriptionNotificationRecordEntity {
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

  // canbe station id or custom location id
  // @ObjectIdColumn({ name: 'location_id' })
  // locationId: string

  @Column({ type: 'string' })
  feedback: string

  @Column({ name: 'feedback_detail' })
  feedbackDetail

  @Column({ type: 'boolean', name: 'wechat_notify_enable' })
  wechatNotifyEnable: boolean

  @Column({ type: 'boolean', name: 'email_notify_enable' })
  emailNotifyEnable: boolean

  @Column({ type: 'double' })
  distance: number

  @Column({ type: 'boolean', name: 'sms_notify_enable' })
  smsNotifyEnable: boolean

  @Column({ type: 'int' })
  priority: TSubscriptionNotificationPriority
  //   @Column({ type: 'boolean', default: false })
  //   success: boolean

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'date' })
  updatedAt: Date
}
