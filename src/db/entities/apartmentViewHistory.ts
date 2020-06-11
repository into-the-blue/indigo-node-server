import { Entity, ObjectID, Column, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'apartmentViewHistory' })
export class ApartmentViewHistoryEntity {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID;

  @ObjectIdColumn({ name: 'apartment_id' })
  apartmentId: string;

  @ObjectIdColumn({ name: 'user_id' })
  userId: string;

  @Column()
  feedback: string;

  @Column({ type: 'date', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'date', name: 'updated_at' })
  updatedAt: Date;
}
