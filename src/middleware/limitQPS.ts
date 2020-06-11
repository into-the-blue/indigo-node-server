import {
  RateLimiterRedis,
  IRateLimiterStoreOptions,
} from 'rate-limiter-flexible';
import { redisClient } from '@/db';

const defaultOptions: IRateLimiterStoreOptions = {
  storeClient: redisClient,
  keyPrefix: 'rateLimiter',
  points: 5,
  duration: 1,
};
const createRateLimiter = (options?: IRateLimiterStoreOptions) => {
  return new RateLimiterRedis({
    ...defaultOptions,
    ...options,
  });
};
export { createRateLimiter };
