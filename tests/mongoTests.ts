import Path from 'path';
import 'reflect-metadata';
require('dotenv').config({
  path: Path.join(__dirname, '..', '.env'),
});
require('module-alias/register');
import { Mongo } from '../src/db';
import moment from 'moment';
import { ObjectId } from 'bson';
import { Jwt, randomHexString } from '../src/utils';

const query1 = async () => {
  const coordinates = [121.448569, 31.222974];

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
  };
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
  };
  const lookupMemberInfo = {
    $lookup: {
      from: 'memberInfos',
      localField: 'user_id',
      foreignField: 'user_id',
      as: 'memberInfo',
    },
  };
  const lookupNotificationRecords = {
    $lookup: {
      from: 'subscriptionNotificationRecords',
      let: { s_subscription_id: '$_id' },
      pipeline: [
        {
          $match: {
            created_at: {
              $gte: new Date(moment().set('date', 1).format('YYYY-MM-DD')),
            },
            $expr: {
              $eq: ['$subscription_id', '$$s_subscription_id'],
            },
          },
        },
      ],
      as: 'notificationRecords',
    },
  };
  const unwindMemberInfo = {
    $unwind: {
      path: '$memberInfo',
      preserveNullAndEmptyArrays: true,
    },
  };
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
  };
  const data = await Mongo.DAO.Subscription.aggregate([
    geoNear,
    redact,
    lookupMemberInfo,
    unwindMemberInfo,
    lookupNotificationRecords,
    project,
  ]).toArray();

  console.warn(data);
};

const query2 = async () => {
  const match = {
    $match: {
      user_id: new ObjectId('5e64c11a7a189568b8525d27'),
      deleted: false,
    },
  };
  const lookup = {
    $lookup: {
      from: 'subscriptionNotificationRecords',
      let: {
        s_subscription_id: '$_id',
      },
      pipeline: [
        {
          $match: {
            created_at: {
              $gte: new Date(moment().add(-1, 'month').format('YYYY-MM-DD')),
            },
            $expr: {
              $eq: ['$subscription_id', '$$s_subscription_id'],
            },
          },
        },
        {
          $sort: {
            created_at: -1,
          },
        },
      ],
      as: 'notificationRecords',
    },
  };
  const project = {
    $project: {
      numOfNotificationRecords: {
        $size: '$notificationRecords',
      },
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
    },
  };
  const data = await Mongo.DAO.Subscription.aggregate([
    match,
    lookup,
    project,
  ]).toArray();
  console.warn(data);
};

const queryMembershipRecords = async () => {
  const records = await Mongo.DAO.MemberTransactionRecord.aggregate([
    {
      $match: {
        user_id: new ObjectId('5e64c11a7a189568b8525d27'),
        type: '5',
        source: 'monthly_activity',
        created_at: {
          $gte: new Date(moment().set('date', 1).format('YYYY-MM-DD')),
        },
      },
    },
  ]).toArray();
  console.warn(records, records.length);
};
const main = async () => {
  await Mongo.connect().catch((err) => {
    console.warn('connection err', err);
  });
};

main();
