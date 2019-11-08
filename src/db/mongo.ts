import { ConnectionOptions, getConnectionManager, Connection } from 'typeorm';
import path from 'path';
import { mongoConfig } from '../config';
const getOptions = (logging: boolean = true, synchronize: boolean = false) => {
  const options: ConnectionOptions = {
    ...mongoConfig,
    entities: [path.join(__dirname, 'entities', '*.js')],
    synchronize,
    logging,
  };
  return options;
};

export const connect = async () => {
  const options = getOptions();
  const manager = getConnectionManager();
  let connection: Connection;
  if (!manager.has('default')) {
    connection = manager.create(options);
  } else {
    connection = manager.get();
  }
  if (!connection.isConnected) {
    await connection.connect();
  }

  return connection;
};
