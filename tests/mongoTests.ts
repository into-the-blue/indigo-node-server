import Path from 'path';
import 'reflect-metadata';
require('dotenv').config({
  path: Path.join(__dirname, '..', '.env'),
});
require('module-alias/register');
import { Mongo, redisClient } from '../src/db';
import { WechatClient } from '../src/services/wechat';
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

const queryUserSubscriptions = async () => {
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

  const lookupUnread = {
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
            viewed: false,
          },
        },
        {
          $sort: {
            created_at: -1,
          },
        },
      ],
      as: 'unreadNotificationRecords',
    },
  };
  const project = {
    $project: {
      numOfNotificationRecords: {
        $size: '$notificationRecords',
      },
      numOfUnreadNotificationRecords: {
        $size: '$unreadNotificationRecords',
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
    lookupUnread,
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

const getWechatAccessToken = async () => {
  const cached = await redisClient.get('wechatAccessToken');
  if (cached) return cached;
  const { accessToken, expiresIn } = await WechatClient.getAccessToken();
  await redisClient.set(
    'wechatAccessToken',
    accessToken,
    'EX',
    +expiresIn - 100
  );
  return accessToken;
};

const testWechat = async (userId: string = '5e64c11a7a189568b8525d27') => {
  const accessToken = await getWechatAccessToken();
  const user = await Mongo.DAO.User.findOne(userId);
  if (!user) return console.warn('user not exist');

  const message = `${'1室1厅0卫'} ${5000}¥ ${50}㎡`;
  const openId = user.authData.openId;
  const res = await WechatClient.sendMessage(accessToken, {
    openId,
    page: '/pages/Profile/builder/index',
    date: moment().format('YYYY-MM-DD HH:MM:SS'),
    aparmentTitle: message,
  });
  console.warn(res);
};

const querySubscriptionRecords = async (subscriptionId: string) => {
  const match = {
    $match: {
      subscription_id: new ObjectId(subscriptionId),
      apartment_id: {
        $exists: true,
      },
    },
  };
  const lookupApartment = {
    $lookup: {
      from: 'apartments',
      let: {
        a_id: '$apartment_id',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$a_id'],
            },
          },
        },
      ],
      as: 'apartment',
    },
  };
  const unwind = {
    $unwind: {
      path: '$apartment',
      preserveNullAndEmptyArrays: true,
    },
  };
  const project = {
    $project: {
      user_id: 1,
      subscription_id: 1,
      apartment_id: 1,
      apartment: { $ifNull: ['$apartment', null] },
      location_id: 1,
      created_at: 1,
      updated_at: 1,
      feedback: 1,
      feedback_detail: 1,
      distance: 1,
      viewed: 1,
    },
  };
  const $skip = {
    $skip: 0,
  };
  const $limit = {
    $limit: 100,
  };
  const $sort = {
    $sort: {
      created_at: -1,
    },
  };
  const notificationRecords = await Mongo.DAO.SubscriptionNotificationRecord.aggregate(
    [match, lookupApartment, unwind, project, $skip, $limit, $sort]
  ).toArray();
  return notificationRecords;
};
const main = async () => {
  await Mongo.connect().catch((err) => {
    console.warn('connection err', err);
  });
};

main();
