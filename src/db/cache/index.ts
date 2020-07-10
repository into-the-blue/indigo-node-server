import { redisClient } from '../redis';
import { merge, from } from 'rxjs';
import { map, filter, take, tap } from 'rxjs/operators';
import { logger } from '@/utils';

export const CACHE_KEYS = {
  'api/location/available_cities': 'api/location/available_cities',
  'graphql/queryApartmentsNearbyStation': (stationId: string, radius: number) =>
    'graphql/queryApartmentsNearbyStation' + stationId + radius,
  'api/subscription/querySubscription': (subscriptionId: string) =>
    'api/subscription/querySubscription' + subscriptionId,
  'api/universal/status': 'api/universal/status',
};

function cache<T>(key: string, value: () => Promise<T>, timeout?: number);
async function cache<T>(
  key: string,
  value: T | (() => Promise<T>),
  timeout: number = 60 * 30
) {
  let data;
  if (typeof value === 'function') {
    data = await (value as () => Promise<T>)();
  } else {
    data = value;
  }
  const existing = await redisClient.get(key);
  if (existing) {
    logger.info(key + ' cache exists');
    return existing;
  }
  return await redisClient
    .set(key, JSON.stringify(data), 'EX', timeout)
    .then((res) => {
      logger.info(key + ' cached');
      return res;
    });
}

export const getCached = <T>(
  key: string,
  getData: () => Promise<T>,
  timeout: number = 60 * 30
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

export { cache };
