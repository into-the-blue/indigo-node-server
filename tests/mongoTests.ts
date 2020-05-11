import Path from 'path'
import 'reflect-metadata'
require('dotenv').config({
  path: Path.join(__dirname, '..', '.env'),
})
require('module-alias/register')
import { Mongo } from '../src/db'
import moment from 'moment'

const main = async () => {
  await Mongo.connect().catch((err) => {
    console.warn('connection err', err)
  })
  const coordinates = [121.448569, 31.222974]

  const geoNear = {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: coordinates,
      },
      sipherical: true,
      distanceField: 'distance',
      query: {
        deleted: false,
      },
    },
  }
  const redact = {
    $redact: {
      $cond: {
        if: {
          $lte: ['$distance', '$radius'],
        },
        then: '$$KEEP',
        else: '$$PRUNE',
      },
    },
  }
  const lookupMemberInfo = {
    $lookup: {
      from: 'memberInfos',
      localField: 'user_id',
      foreignField: 'user_id',
      as: 'memberInfo',
    },
  }
  const lookupNotificationRecords = {
    $lookup: {
      from: 'subscriptionNotificationRecords',
      let: { s_subscription_id: '$_id' },
      pipeline: [
        {
          $match: {
            created_at: {
              $gte: new Date(moment().set('day', 1).format('YYYY-MM-DD')),
            },
            $expr: {
              $eq: ['$subscription_id', '$$s_subscription_id'],
            },
          },
        },
      ],
      as: 'notificationRecords',
    },
  }
  const unwindMemberInfo = {
    $unwind: {
      path: '$memberInfo',
      preserveNullAndEmptyArrays: true,
    },
  }
  const project = {
    $project: {
      type: 1,
      coordiantes: 1,
      city: 1,
      radius: 1,
      user_id: 1,
      conditions: 1,
      address: 1,
      payload: 1,
      created_at: 1,
      updated_at: 1,
      notificationRecords: 1,
      memberInfo: { $ifNull: ['$memberInfo', {}] },
    },
  }
  const data = await Mongo.DAO.Subscription.aggregate([
    geoNear,
    redact,
    lookupMemberInfo,
    unwindMemberInfo,
    lookupNotificationRecords,
    project,
  ]).toArray()

  console.warn(data)
}

main()
