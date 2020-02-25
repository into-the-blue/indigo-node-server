require('module-alias/register')
import Path, { format } from 'path'
require('dotenv').config({ path: Path.join(__dirname, '../.env') })
import 'reflect-metadata'
import { Mongo } from '../src/db'
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
import { Apartment } from '../src/db/entities'
import Agenda from 'agenda'
const agenda = new Agenda({
  db: {
    address: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`,
    options: { authSource: 'admin' },
    collection: 'agendaJobs',
  },
})
agenda.define('delete old users',  job => {
  console.warn('aaa', Date())
})
;(async function() {
  // IIFE to give access to async/await
  await agenda.start()

  // await agenda.every('3 minutes', 'delete old users')

  // Alternatively, you could also do:
  await agenda.every('*/1 * * * *', 'delete old users')
})()
// const median = (arr: number[]): number => {
//   const isOdd = arr.length % 2 !== 0
//   if (isOdd) return arr[(arr.length + 1) / 2]
//   return +((arr[arr.length / 2] + arr[arr.length / 2 + 1]) / 2).toFixed(2)
// }

// const compute = (apts: Apartment[], target: Apartment) => {
//   const total = apts.length
//   const prices = apts
//     .map(a => a.price)
//     .concat(target.price)
//     .sort((a, b) => a - b)
//   const PPSM = apts
//     .map(a => a.pricePerSquareMeter)
//     .concat(target.pricePerSquareMeter)
//     .sort((a, b) => a - b)
//   const areas = apts
//     .map(a => a.area)
//     .concat(target.area)
//     .sort((a, b) => a - b)
//   const averagePrice = +mean(prices).toFixed(2)
//   const averagePPSM = +mean(PPSM).toFixed(2)
//   const averageArea = +mean(areas).toFixed(2)
//   const rankingOfPPSM = PPSM.indexOf(target.pricePerSquareMeter)
//   const rankingOfPrice = prices.indexOf(target.price)
//   const rankingOfArea = areas.indexOf(target.area)

//   const medianPPSM = median(PPSM)
//   const medianPrice = median(prices)
//   const medianArea = median(areas)

//   const lowestPPSM = (apts.find(a => a.pricePerSquareMeter === PPSM[0]) || {})
//     .id
//   const lowestPrice = (apts.find(a => a.price === prices[0]) || {}).id
//   return {
//     updatedAt: new Date(),
//     averagePrice,
//     averagePPSM,
//     averageArea,
//     medianPPSM,
//     medianPrice,
//     medianArea,
//     rankingOfPPSM,
//     rankingOfPrice,
//     rankingOfArea,
//     lowestPPSM,
//     lowestPrice,
//     total,
//   }
// }

// const findApartmentsNearby = (apartment: Apartment, range: number) =>
//   Mongo.DAO.Apartment.find({
//     where: {
//       $query: {
//         $or: [
//           {
//             expired: false,
//           },
//           {
//             expired: { $exists: false },
//           },
//         ],
//         coordinates: {
//           $near: {
//             $geometry: {
//               type: 'Point',
//               coordinates: apartment.coordinates,
//             },
//             $minDistance: 0,
//             $maxDistance: range,
//           },
//         },
//       },
//       $orderby: { updated_time: -1 },
//       $project: {
//         area: 1,
//         price_per_square_meter: 1,
//         price: 1,
//       },
//     },
//   })
// ;(async () => {
//   await Mongo.connect()
//   const apartments = await Mongo.DAO.Apartment.find({
//     where: {
//       $and: [
//         {
//           $or: [
//             {
//               expired: false,
//             },
//             {
//               expired: { $exists: false },
//             },
//           ],
//         },
//         {
//           $or: [
//             {
//               computed: {
//                 $exists: false,
//               },
//             },
//             {
//               'computed.updated_at': {
//                 $lte: new Date(
//                   Moment()
//                     .add(-25, 'hours')
//                     .toISOString()
//                 ),
//               },
//             },
//           ],
//         },
//       ],
//     },
//     // order: {
//     //   updatedTime: -1,
//     // },
//     // take: 1000,
//   })
//   const BATCH_SIZE = 100
//   const RANGE = 500
//   const EPOCHS = apartments.length / BATCH_SIZE
//   from(apartments)
//     .pipe(
//       bufferCount(BATCH_SIZE),
//       concatMap((as, batch) => {
//         console.time('s' + batch)
//         return from(as).pipe(
//           mergeMap(apartment => {
//             return from(findApartmentsNearby(apartment, RANGE)).pipe(
//               map(apts => {
//                 const res = compute(apts, apartment)
//                 return {
//                   ...res,
//                   range: RANGE,
//                 }
//               }),
//               switchMap(computed =>
//                 Mongo.DAO.Apartment.updateOne(
//                   { _id: apartment.id },
//                   {
//                     $set: {
//                       computed,
//                       updated_at: new Date(),
//                     },
//                   }
//                 )
//               )
//             )
//           }),
//           toArray(),
//           mapTo(batch)
//         )
//       }),
//       tap(_ => console.timeEnd('s' + _))
//     )
//     .subscribe()
// })()
