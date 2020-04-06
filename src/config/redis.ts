/*
 * File: /Users/origami/Desktop/templates/node-express-template/src/config/redis.ts
 * Project: /Users/origami/Desktop/templates/node-express-template
 * Created Date: Friday July 12th 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Friday July 12th 2019 3:52:24 pm
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
import Redis from 'ioredis'
import { logger } from '@/utils'
const client = new Redis({
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: 6379,
  keyPrefix: 'indigo_node',
  db: 0,
})
client.on('error', (error) => {
  logger.error('redis: ' + JSON.stringify(error))
})
export default client
