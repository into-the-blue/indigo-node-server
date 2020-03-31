import {
  ConnectionOptions,
  getConnectionManager,
  Connection,
  getMongoRepository,
} from 'typeorm'
import path from 'path'
import {
  ApartmentEntity,
  LineEntity,
  StationEntity,
  UserEntity,
  SubscriptionEntity,
} from './entities'
// configurations of mongo db
const getBaseMongoConfig = (): ConnectionOptions => ({
  type: 'mongodb',
  port: 27017,
  username: process.env.MONGO_USERNAME,
  password: process.env.MONGO_PASSWORD,
  host: process.env.MONGO_HOST,
  database: process.env.MONGO_DB,
  authSource: 'admin',
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

export const getMongoOptions = (
  logging: boolean = true,
  synchronize: boolean = false
) => {
  const options: ConnectionOptions = {
    ...getBaseMongoConfig(),
    entities: [
      path.join(
        __dirname,
        'entities',
        `*.${['test', 'dev'].includes(process.env.NODE_ENV) ? 'ts' : 'js'}`
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
      coordinates: '2dsphere',
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
    coordinates: '2dsphere',
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
