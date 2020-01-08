import {
  RateLimiterRedis,
  IRateLimiterStoreOptions,
} from 'rate-limiter-flexible'
import { redis } from '@/config'

const defaultOptions: IRateLimiterStoreOptions = {
  storeClient: redis,
  keyPrefix: 'rateLimiter',
  points: 5,
  duration: 1,
}
const createRateLimiter = (options?: IRateLimiterStoreOptions) => {
  return new RateLimiterRedis({
    ...defaultOptions,
    ...options,
  })
}
export { createRateLimiter }
