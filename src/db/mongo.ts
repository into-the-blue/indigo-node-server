import {
  ConnectionOptions,
  getConnectionManager,
  Connection,
  getMongoRepository,
} from 'typeorm'
import path from 'path'
import {
  Apartment as ApartmentEntity,
  Line as LineEntity,
  Station as StationEntity,
  User as UserEntity,
} from './entities'
import { Subscription as SubscriptionEntity } from './entities/subscription'
const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_DB } = process.env
// configurations of mongo db
const baseMongoConfig: ConnectionOptions = {
  type: 'mongodb',
  port: 27017,
  username: MONGO_USERNAME,
  password: MONGO_PASSWORD,
  host: MONGO_HOST,
  database: MONGO_DB,
  authSource: 'admin',
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

export const getMongoOptions = (
  logging: boolean = true,
  synchronize: boolean = false
) => {
  const options: ConnectionOptions = {
    ...baseMongoConfig,
    entities: [
      path.join(
        __dirname,
        'entities',
        `*.${process.env.NODE_ENV === 'dev' ? 'ts' : 'js'}`
      ),
    ],
    synchronize,
    logging,
  }
  return options
}

const ensureIndexes = async () => {
  const apartmentIndexes = [
    { house_code: 1 },
    { created_time: -1 },
    { coordinates: '2dsphere' },
    { price: 1 },
    { price_per_square_meter: -1 },
    { area: 1 },
    { created_at: -1 },
  ]
  const subscriptionIndexes = [
    {
      coordinate: '2dsphere',
    },
    {
      updatedAt: -1,
    },
    {
      radius: -1,
    },
  ]
  await Promise.all(
    apartmentIndexes.map(idx => DAO.Apartment.createCollectionIndex(idx))
  )
  await Promise.all(
    subscriptionIndexes.map(idx => DAO.Subscription.createCollectionIndex(idx))
  )
  await DAO.Station.createCollectionIndex({
    coordinate: '2dsphere',
  })
}

export const connect = async () => {
  const options = getMongoOptions()
  const manager = getConnectionManager()
  let connection: Connection
  if (!manager.has('default')) {
    connection = manager.create(options)
  } else {
    connection = manager.get()
  }
  if (!connection.isConnected) {
    await connection.connect()
    await ensureIndexes()
  }
  return connection
}

export class DAO {
  static get Apartment() {
    return getMongoRepository(ApartmentEntity)
  }
  static get Line() {
    return getMongoRepository(LineEntity)
  }
  static get Station() {
    return getMongoRepository(StationEntity)
  }

  static get User() {
    return getMongoRepository(UserEntity)
  }

  static get Subscription() {
    return getMongoRepository(SubscriptionEntity)
  }
}
