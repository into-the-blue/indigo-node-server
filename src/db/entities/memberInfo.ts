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

  @Column({ name: 'subscription_quota', type: 'int', default: 0 })
  subscriptionQuota: number
  // doesn't make sense?
  // @Column({ name: 'notification_quota', type: 'int', default: 0 })
  // notificationQuota: number

  @Column({ name: 'sms_notify_quota', type: 'int', default: 0 })
  smsNotifyQuota: number

  @Column({ name: 'email_notify_quota', type: 'int', default: 0 })
  emailNotifyQuota: number

  @Column({ name: 'wechat_notify_quota', type: 'int', default: 0 })
  wechatNotifyQuota: number

  @Column({ name: 'expire_at', type: 'date' })
  expireAt: Date

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'date' })
  updatedAt: Date
}
