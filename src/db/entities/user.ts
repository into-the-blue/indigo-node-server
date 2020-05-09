import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm'
import { TRegistrationType } from '@/types'

@Entity({ name: 'users' })
export class UserEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID

  @Column({ type: 'string', nullable: false })
  username: string

  @Column({ name: 'real_name', type: 'string', default: null })
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

  @Column({ type: 'string', default: null })
  email: string

  @Column({ type: 'string' })
  language: string

  @Column({ name: 'created_at', type: 'date', default: Date.now() })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'date', default: Date.now() })
  updatedAt: Date
}
