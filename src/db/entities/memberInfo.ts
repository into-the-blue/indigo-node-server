import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm'
import { TMemberType } from '@/types'

@Entity({
  name: 'memberInfos',
})
export class MemberInfoEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @ObjectIdColumn({ name: 'user_id' })
  userId: ObjectID

  @Column({ type: 'string' })
  type: TMemberType

  @Column({ name: 'sms_enable', type: 'boolean' })
  smsEnable: boolean

  @Column({ name: 'email_enable', type: 'boolean' })
  emailEnable: boolean

  @Column({ name: 'wechat_enable', type: 'boolean' })
  wechatEnable: boolean

  @Column({ name: 'notification_enable', type: 'boolean' })
  notificationEnable: boolean

  @Column({ name: 'max_subscription_count', type: 'int' })
  maxSubscriptionCount: number

  @Column({ name: 'max_notification_count', type: 'int' })
  maxNotificationCount: number

  @Column({ name: 'max_sms_count', type: 'int' })
  maxSmsCount: number

  @Column({ name: 'expire_at', type: 'date' })
  expireAt: Date

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'date' })
  updatedAt: Date
}
