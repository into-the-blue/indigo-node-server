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
} from './entities'
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
}
// export const Apartment = getMongoRepository(ApartmentEntity)
// export const Line = getMongoRepository(LineEntity)
// export const Station = getMongoRepository(StationEntity)
