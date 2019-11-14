import { ConnectionOptions, getConnectionManager, Connection } from 'typeorm'
import path from 'path'
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
    entities: [path.join(__dirname, 'entities', '*.js')],
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
