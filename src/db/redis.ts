import Redis from 'ioredis';
import { logger } from '@/utils';

const redisClient = new Redis({
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: 6379,
  keyPrefix: 'indigo_node',
  db: 0,
});
redisClient.on('error', (error) => {
  logger.error('[redis]: ' + JSON.stringify(error));
});
export { redisClient };
