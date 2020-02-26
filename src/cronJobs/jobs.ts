import Agenda from 'agenda'
import { Mongo } from '@/db'
import Moment from 'moment'
import { from } from 'rxjs'
import {
  map,
  buffer,
  bufferCount,
  concatMap,
  mergeMap,
  tap,
  switchMap,
  toArray,
  mapTo,
} from 'rxjs/operators'
import { mean } from 'lodash'
import { Apartment } from '@/db/entities'
import { logger, toCamelCase } from '@/utils'
export const CRON_JOBS = {
  computeApartments:
    'computeApartments' + process.env.NODE_ENV === 'dev' ? '_dev' : '',
  queryApartmentsToCompute:
    'queryApartmentsToCompute' + process.env.NODE_ENV === 'dev' ? '_dev' : '',
}

const RANGE = 500

const median = (arr: number[]): number => {
  const isOdd = arr.length % 2 !== 0
  if (isOdd) return arr[(arr.length + 1) / 2]
  return +((arr[arr.length / 2] + arr[arr.length / 2 + 1]) / 2).toFixed(2)
}

const compute = (apts: Apartment[], target: Apartment) => {
  const total = apts.length
  const prices = apts
    .map(a => a.price)
    .concat(target.price)
    .sort((a, b) => a - b)
  const PPSM = apts
    .map(a => a.pricePerSquareMeter)
    .concat(target.pricePerSquareMeter)
    .sort((a, b) => a - b)
  const areas = apts
    .map(a => a.area)
    .concat(target.area)
    .sort((a, b) => a - b)
  const averagePrice = +mean(prices).toFixed(2)
  const averagePPSM = +mean(PPSM).toFixed(2)
  const averageArea = +mean(areas).toFixed(2)
  const rankingOfPPSM = PPSM.indexOf(target.pricePerSquareMeter)
  const rankingOfPrice = prices.indexOf(target.price)
  const rankingOfArea = areas.indexOf(target.area)

  const medianPPSM = median(PPSM)
  const medianPrice = median(prices)
  const medianArea = median(areas)

  const lowestPPSM = (apts.find(a => a.pricePerSquareMeter === PPSM[0]) || {})
    .id
  const lowestPrice = (apts.find(a => a.price === prices[0]) || {}).id
  return {
    updatedAt: new Date(),
    averagePrice,
    averagePPSM,
    averageArea,
    medianPPSM,
    medianPrice,
    medianArea,
    rankingOfPPSM,
    rankingOfPrice,
    rankingOfArea,
    lowestPPSM,
    lowestPrice,
    total,
  }
}

const findApartmentsNearby = (coordinates: number[], range: number) =>
  Mongo.DAO.Apartment.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: coordinates },
        distanceField: 'distance',
        minDistance: 0,
        maxDistance: range,
        query: { expired: { $ne: true } },
        key: 'coordinates',
        spherical: true,
      },
    },
    {
      $project: {
        area: 1,
        price_per_square_meter: 1,
        price: 1,
        created_at: 1,
        distance: 1,
      },
    },
  ]).toArray()

const computeSingleApartment = (apartment: Apartment) =>
  from(findApartmentsNearby(apartment.coordinates, RANGE)).pipe(
    map(apts => apts.map(toCamelCase)),
    map(apts => {
      const res = compute(apts, apartment)
      return {
        ...res,
        range: RANGE,
      }
    }),
    switchMap(computed =>
      Mongo.DAO.Apartment.updateOne(
        { _id: apartment.id },
        {
          $set: {
            computed,
            updated_at: new Date(),
          },
        }
      )
    )
  )

const findApartmentsToCompute = (limit: number = 100): Promise<Apartment[]> =>
  Mongo.DAO.Apartment.aggregate([
    {
      $match: {
        coordinates: { $ne: null },
        $and: [
          {
            expired: { $ne: true },
          },
          {
            $or: [
              {
                computed: {
                  $exists: false,
                },
              },
              {
                'computed.updated_at': {
                  $lte: new Date(
                    Moment()
                      .add(-25, 'hours')
                      .toISOString()
                  ),
                },
              },
            ],
          },
        ],
      },
    },
    {
      $sort: {
        updated_time: -1,
      },
    },
    {
      $project: {
        area: 1,
        price_per_square_meter: 1,
        price: 1,
        updated_time: 1,
        coordinates: 1,
      },
    },
    { $limit: limit },
  ]).toArray()

export default (agenda: Agenda) => {
  agenda.define(CRON_JOBS.computeApartments, (job, done) => {
    const { apartment } = job.attrs.data
    // logger.info('START JOB ' + CRON_JOBS.computeApartments)
    computeSingleApartment(apartment).subscribe({
      error: err => {
        logger.error(err)
        done(err)
      },
      complete: () => {
        logger.info('DONE ' + CRON_JOBS.computeApartments)
        done()
      },
    })
  })

  agenda.define(CRON_JOBS.queryApartmentsToCompute, (job, done) => {
    logger.info('START JOB ' + CRON_JOBS.queryApartmentsToCompute)
    from(findApartmentsToCompute())
      .pipe(
        switchMap(d => from(d)),
        map(toCamelCase),
        mergeMap(apt =>
          agenda.now(CRON_JOBS.computeApartments, {
            apartment: apt,
          })
        )
        // bufferCount(BATCH_SIZE),
        // concatMap((as, batch) => {
        //   return from(as).pipe(
        //     mergeMap(apartment => {
        //       return from(
        //         findApartmentsNearby(apartment.coordinates, RANGE)
        //       ).pipe(
        //         map(apts => apts.map(toCamelCase)),
        //         map(apts => {
        //           const res = compute(apts, apartment)
        //           return {
        //             ...res,
        //             range: RANGE,
        //           }
        //         }),
        //         switchMap(computed =>
        //           Mongo.DAO.Apartment.updateOne(
        //             { _id: apartment.id },
        //             {
        //               $set: {
        //                 computed,
        //                 updated_at: new Date(),
        //               },
        //             }
        //           )
        //         )
        //       )
        //     }),
        //     toArray(),
        //     mapTo(batch)
        //   )
        // }),
        // tap(_ => logger.info('done', _))
      )
      .subscribe({
        error: err => {
          logger.error(err)
          done(err)
        },
        complete: () => {
          logger.info('DONE ' + CRON_JOBS.queryApartmentsToCompute)
          done()
        },
      })
  })
}
