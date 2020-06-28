import Redis from 'ioredis';
import { logger } from '@/utils';
import { merge, from } from 'rxjs';
import { map, filter, take, tap } from 'rxjs/operators';

const redisClient = new Redis({
  // password: process.env.REDIS_PASSWORD,
  host: 'redis',
  port: +process.env.REDIS_PORT,
  keyPrefix: 'indigo_node',
  db: 0,
});
redisClient.on('error', (error) => {
  logger.error('[redis]: ', error);
});

export const getCached = <T>(
  key: string,
  getData: () => Promise<T>,
  timeout: number
): Promise<T> => {
  return merge(
    from(redisClient.get(key)).pipe(
      filter((o) => !!o),
      map((o) => JSON.parse(o) as any),
      tap(() => logger.info(`[${key}] cached data got`))
    ),
    from(getData()).pipe(
      tap((data) => {
        logger.info(`[${key}] db data got`);
        redisClient
          .set(key, JSON.stringify(data), 'EX', timeout)
          .catch((err) => {});
      })
    )
  )
    .pipe(take(1))
    .toPromise();
};
export { redisClient };
