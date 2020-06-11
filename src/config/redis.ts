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

export const redisDefaultConfig = {
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: 6379,
  keyPrefix: 'indigo_node',
  db: 0,
};
