import { Entity, ObjectIdColumn, Column ,ObjectID} from 'typeorm';

@Entity({ name: 'stations' })
export class Station {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectID;

  @Column({ name: 'station_id', type: 'int' })
  stationId: number;

  @Column({ name: 'line_id', type: 'int' })
  lineId: number;

  @Column({ name: 'station_name' })
  stationName: string;

  @Column()
  url: string;

  @Column({ name: 'line_ids', type: 'array' })
  lineIds: number[];

  @Column({ type: 'array' })
  urls: string[];

  @Column()
  city: string;
}
