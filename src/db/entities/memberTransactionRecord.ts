import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';
import { TMemberType, TMemberPurchaseSource } from '@/types';

@Entity({
  name: 'memberTransactionRecords',
})
export class MemberTransactionRecordEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID;

  @ObjectIdColumn({ name: 'user_id' })
  userId: ObjectID;

  @Column({ type: 'int', name: 'origin_price' })
  originPrice: number;

  @Column({ type: 'double' })
  price: number;

  @Column({ type: 'double', default: null })
  discount: number;

  @Column({ type: 'string' })
  type: TMemberType;

  @Column({ type: 'string' })
  source: TMemberPurchaseSource;

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'date' })
  updatedAt: Date;
}
