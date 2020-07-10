import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectID } from 'bson';

@Entity({
  name: 'tasks',
})
export class TaskEntity {
  @ObjectIdColumn({
    name: '_id',
  })
  id: ObjectID;

  @Column({})
  url: string;

  @Column()
  city: string;
  @Column()
  source: string;

  @Column()
  status: string;

  @Column({ name: 'station_info' })
  stationInfo: null | object;

  @Column({ type: 'date', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'date', name: 'updated_at' })
  updatedAt: Date;
}
