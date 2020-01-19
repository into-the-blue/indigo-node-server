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
import redis from 'redis'
import { logger } from '@/utils'
const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: 6379,
  prefix: 'indigo_node',
})
client.on('error', error => {
  logger.error(error)
})
export default client
