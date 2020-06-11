import { Mongo } from '@/db';
import {
  ISubscription,
  TSubCondition,
  TSubscriptionPayload,
  IMetroStation,
  IApartment,
  ICustomLocation,
} from '@/types';
import { SubscriptionInvalidValue } from '../utils/errors';
import { toSnakeCase, toCamelCase, logger, Omit } from '@/utils';
import {
  findSubscriptionsInRange,
  handleConditions,
  handleMemberSetting,
  mapMemberTypeToPriority,
} from './helper';
import { ObjectId } from 'bson';
import { agenda, CRON_JOBS } from '@/cronJobs';
import moment from 'moment';
import {
  SubscriptionEntity,
  SubscriptionNotificationRecordEntity,
} from '@/db/entities';
import { from } from 'rxjs';
import { map, bufferCount, concatMap, mergeMap } from 'rxjs/operators';

type TInitialProps =
  | {
      id?: string;
      coordinates: [number, number];
      type: 'metroStation';
      city: string;
      radius: number;
      address: string;
      payload: IMetroStation;
      userId: string;
      conditions: TSubCondition[];
    }
  | {
      id?: string;
      coordinates: [number, number];
      type: 'customLocation';
      city: string;
      radius: number;
      address: string;
      payload?: Pick<
        ICustomLocation,
        'city' | 'address' | 'name' | 'district'
      > & { id: string };
      userId: string;
      conditions: TSubCondition[];
    };

const validator = {
  type: (type: string) => {
    return ['metroStation', 'customLocation'].includes(type);
  },
  city: (city: string) => {
    return typeof city === 'string';
  },
  radius: (radius: number) => {
    return !isNaN(+radius) && radius >= 0;
  },
  userId: (userId: string) => typeof userId === 'string',
  conditions: (conditions: TSubCondition[]) => {
    return conditions.every((con) => {
      if (con.type === 'range') {
        return con.condition.every((o) => !isNaN(+o));
      }
      if (con.type === 'boolean') {
        return typeof con.condition === 'boolean';
      }
      return false;
    });
  },
  coordinates: (coordinates: [number, number]) =>
    coordinates.length === 2 && coordinates.every((o) => !isNaN(o)),
  address: (address: string) => typeof address === 'string',
  payload: (
    payload: TSubscriptionPayload,
    instance: Omit<ISubscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (instance.type === 'metroStation')
      return typeof payload['stationId'] === 'string';
    if (instance.type === 'customLocation') return true;
    return false;
  },
};

export class SubscriptionModel {
  instance: Omit<
    ISubscription,
    'id' | 'createdAt' | 'updatedAt' | 'deleted'
  > & {
    address: string;
  };

  constructor(props: TInitialProps) {
    const {
      type,
      coordinates,
      city,
      radius,
      userId,
      conditions,
      id,
      payload,
      address,
      ...restProps
    } = props;
    this.instance = {
      type,
      coordinates,
      city,
      radius,
      userId,
      conditions,
      address,
      payload: {
        ...restProps,
        ...payload,
      },
    };
    if (id) {
      Object.assign(this.instance, { id });
    }
  }

  validate = () => {
    const pass = Object.keys(this.instance).every((key) =>
      validator[key](this.instance[key], this.instance)
    );
    if (!pass) throw new SubscriptionInvalidValue();
    return pass;
  };

  save = async () => {
    const snakeCased = toSnakeCase(Omit(this.instance, ['userId']));
    const existing = await Mongo.DAO.Subscription.findOne({
      where: {
        coordinates: this.instance.coordinates,
        deleted: false,
        user_id: new ObjectId(this.instance.userId),
      },
    });
    if (existing) {
      await Mongo.DAO.Subscription.updateOne(
        {
          _id: existing.id,
        },
        {
          $set: {
            ...snakeCased,
            updated_at: new Date(),
          },
        }
      );
      return existing.id;
    }
    return (
      await Mongo.DAO.Subscription.insertOne({
        ...snakeCased,
        payload: this.instance.payload,
        user_id: new ObjectId(this.instance.userId),
        created_at: new Date(),
        updated_at: new Date(),
        deleted: false,
      })
    ).insertedId;
  };

  update = () => {
    const toUpdate: any = {};
    Object.keys(this.instance).forEach((key) => {
      if (key === 'id') return;
      if (this.instance[key]) {
        toUpdate[toCamelCase(key)] = this.instance[key];
      }
    });
    return Mongo.DAO.Subscription.updateOne(
      {
        _id: new ObjectId(this.instance['id']),
      },
      {
        $set: {
          ...toUpdate,
          updated_at: new Date(),
        },
      }
    );
  };

  static delete = async (id: string, user_id: string) => {
    const res = await Mongo.DAO.Subscription.updateOne(
      {
        _id: new ObjectId(id),
        user_id: new ObjectId(user_id),
      },
      {
        $set: {
          deleted: true,
        },
      }
    );

    return {
      success: res.result.ok === 1,
      deletedCount: res.upsertedCount,
    };
  };

  static notify = async (apartmentId: string) => {
    const apartment = await Mongo.DAO.Apartment.findOne(apartmentId);
    const subsInRange = await findSubscriptionsInRange(apartment.coordinates);
    logger.info('[subs in range]', subsInRange.length);
    // filter out subscriptions not matched
    const matched = subsInRange.filter((sub) =>
      handleConditions(sub.conditions, apartment)
    );
    logger.info('[matched]', matched.length);
    // check if users reached notification quota
    let notifications = [];
    let notificationEnabled = [];
    matched.forEach((sub) => {
      const enables = handleMemberSetting(
        sub.memberInfo,
        sub.notificationRecords
      );
      const obj = {
        priority: mapMemberTypeToPriority(sub.memberInfo.type),
        wechat_notify_enable: enables.wechatNotifyEnable,
        email_notify_enable: enables.emailNotifyEnable,
        sms_notify_enable: enables.smsNotifyEnable,
        // location_id:
        //   sub.payload['stationId'] || sub.payload['customLocationId'],
        apartment_id: apartment.id,
        subscription_id: new ObjectId(sub.id),
        user_id: new ObjectId(sub.userId),
        distance: sub.distance,
      };
      notifications.push(obj);
      if (
        obj.wechat_notify_enable ||
        obj.email_notify_enable ||
        obj.sms_notify_enable
      ) {
        notificationEnabled.push({
          ...obj,
          address: sub.address,
          price: apartment.price,
          area: apartment.area,
          house_type: apartment.houseType,
          distance: sub.distance.toFixed(0),
        });
      }
    });
    if (notifications.length) {
      await from(notifications)
        .pipe(
          map((r) => ({
            ...r,
            created_at: new Date(),
            expired_at: new Date(),
            viewed: false,
          })),
          bufferCount(100),
          concatMap((notis) =>
            Mongo.DAO.SubscriptionNotificationRecord.insertMany(notis)
          )
        )
        .toPromise();
    }
    logger.info('[insert nitofications]', notifications.length);
    // add into agendas
    // order notifications by member level
    await agenda.now(CRON_JOBS.computeApartments, { apartment });
    await from(notificationEnabled)
      .pipe(
        bufferCount(100),
        concatMap((data) =>
          from(data).pipe(
            mergeMap((item) => {
              if (item.priority === 0) {
                return agenda.now(CRON_JOBS.sendSubscriptionNotification, item);
              }
              return agenda.schedule(
                `in ${item.priority * 10} minutes`,
                CRON_JOBS.sendSubscriptionNotification,
                item
              );
            })
          )
        )
      )
      .toPromise();
    logger.info('[tasks]', notificationEnabled.length);
    await Mongo.DAO.Apartment.updateOne(
      {
        _id: new ObjectId(apartmentId),
      },
      {
        $set: {
          notified: notificationEnabled.length,
        },
      }
    );
    return notificationEnabled;
  };

  /**
   *
   *
   * @static
   * @memberof SubscriptionModel
   */
  static findSubscriptions = async (
    userId: string,
    conditions?: Pick<IApartment, 'coordinates'>
  ): Promise<SubscriptionEntity[]> => {
    const match = {
      $match: {
        user_id: new ObjectId(userId),
        deleted: false,
        ...conditions,
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
        coordinates: 1,
        type: 1,
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
    return data.map(toCamelCase);
  };

  static findSubscriptionNotificationRecords = async (
    subscriptionId: string,
    skip?: number
  ): Promise<SubscriptionNotificationRecordEntity[]> => {
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
      $skip: +skip || 0,
    };
    const $limit = {
      $limit: 100,
    };
    const notificationRecords = await Mongo.DAO.SubscriptionNotificationRecord.aggregate(
      [match, lookupApartment, unwind, project, $skip, $limit]
    ).toArray();
    return notificationRecords.map(toCamelCase);
  };

  static canCreateNewSubscription = async (userId: string) => {
    const _userId = new ObjectId(userId);
    const memberInfo = await Mongo.DAO.MemberInfo.findOne({
      where: {
        user_id: _userId,
      },
    });
    if (!memberInfo) return false;
    const subs = await Mongo.DAO.Subscription.find({
      where: {
        user_id: _userId,
        deleted: false,
      },
    });
    return memberInfo.subscriptionQuota > subs.length;
  };
}
