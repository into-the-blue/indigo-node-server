import Redis from 'ioredis';
import { logger } from '@/utils';

const redisClient = new Redis({
  // password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
  keyPrefix: 'indigo_node',
  db: 0,
});
redisClient.on('error', (error) => {
  logger.error('[redis]: ', error);
});

export { redisClient };
