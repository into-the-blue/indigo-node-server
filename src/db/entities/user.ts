import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm'
type TRegistrationType = 'wechat'

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @Column({ type: 'string', nullable: false })
  username: string

  @Column({ name: 'real_name', type: 'string' })
  realName

  @Column({ type: 'string' })
  avatar: string

  @Column({ name: 'auth_data', default: null })
  authData: object

  @Column({ name: 'registration_type', type: 'string', nullable: false })
  registrationType: TRegistrationType

  @Column({ name: 'phone_number', type: 'string', default: null })
  phoneNumber: string

  @Column({ name: 'gender', type: 'int', default: 2 })
  gender: number

  @Column({ type: 'string' })
  country: string

  @Column({ type: 'string' })
  province: string

  @Column({ type: 'string' })
  city: string

  @Column({ name: 'created_at', type: 'date', default: Date.now() })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'date', default: Date.now() })
  updatedAt: Date
}
