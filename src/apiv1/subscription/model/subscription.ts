import { Mongo } from '@/db'
import {
  ISubscription,
  TSubCondition,
  TSubscriptionPayload,
  IMetroStation,
} from '@/types'
import { SubscriptionInvalidValue } from '../utils/errors'
import { toSnakeCase, toCamelCase } from '@/utils'
import {
  findSubscriptionsInRange,
  handleConditions,
  handleMemberSetting,
  mapMemberTypeToPriority,
} from './helper'
import { ObjectId } from 'bson'
import { DAO } from '@/db/mongo'
import { agenda, CRON_JOBS } from '@/cronJobs'
type TInitialProps =
  | {
      id?: string
      coordinates: [number, number]
      type: 'metroStation'
      city: string
      radius: number
      address: string
      payload: IMetroStation
      userId: string
      conditions: TSubCondition[]
    }
  | {
      id?: string
      coordinates: [number, number]
      type: 'customLocation'
      city: string
      radius: number
      address: string
      payload?: any
      userId: string
      conditions: TSubCondition[]
    }

const validator = {
  type: (type: string) => {
    return ['metroStation', 'customLocation'].includes(type)
  },
  city: (city: string) => {
    return typeof city === 'string'
  },
  radius: (radius: number) => {
    return !isNaN(+radius) && radius >= 0
  },
  userId: (userId: string) => typeof userId === 'string',
  conditions: (conditions: TSubCondition[]) => {
    return conditions.every((con) => {
      if (con.type === 'range') {
        return con.condition.every((o) => !isNaN(+o))
      }
      if (con.type === 'boolean') {
        return typeof con.condition === 'boolean'
      }
      return false
    })
  },
  coordinates: (coordinates: [number, number]) =>
    coordinates.length === 2 && coordinates.every((o) => !isNaN(o)),
  address: (address: string) => typeof address === 'string',
  payload: (
    payload: TSubscriptionPayload,
    instance: Omit<ISubscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (instance.type === 'metroStation')
      return typeof payload['stationId'] === 'string'
    if (instance.type === 'customLocation') return true
    return false
  },
}

export class SubscriptionModel {
  instance: Omit<
    ISubscription,
    'id' | 'createdAt' | 'updatedAt' | 'deleted'
  > & {
    address: string
  }

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
    } = props
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
    }
    if (id) {
      Object.assign(this.instance, { id })
    }
  }

  validate = () => {
    const pass = Object.keys(this.instance).every((key) =>
      validator[key](this.instance[key], this.instance)
    )
    if (!pass) throw new SubscriptionInvalidValue()
    return pass
  }

  save = () => {
    return Mongo.DAO.Subscription.insertOne({
      ...toSnakeCase(this.instance),
      payload: this.instance.payload,
      user_id: new ObjectId(this.instance.userId),
      created_at: new Date(),
      updated_at: new Date(),
    })
  }

  update = () => {
    const toUpdate: any = {}
    Object.keys(this.instance).forEach((key) => {
      if (key === 'id') return
      if (this.instance[key]) {
        toUpdate[toCamelCase(key)] = this.instance[key]
      }
    })
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
    )
  }

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
    )

    return {
      success: res.result.ok === 1,
      deletedCount: res.upsertedCount,
    }
  }

  static notify = async (apartmentId: string) => {
    const apartment = await Mongo.DAO.Apartment.findOne(apartmentId)
    const subsInRange = await findSubscriptionsInRange(apartment.coordinates)
    // filter out subscriptions not matched
    const matched = subsInRange.filter((sub) =>
      handleConditions(sub.conditions, apartment)
    )
    // check if users reached notification quota
    let notifications = []
    let notificationEnabled = []
    matched.forEach((sub) => {
      const enables = handleMemberSetting(
        sub.memberInfo,
        sub.notificationRecords
      )
      const obj = {
        priority: mapMemberTypeToPriority(sub.memberInfo.type),
        wechat_notify_enable: enables.wechatNotifyEnable,
        email_notify_enable: enables.emailNotifyEnable,
        sms_notify_enable: enables.smsNotifyEnable,
        location_id:
          sub.payload['stationId'] || sub.payload['customLocationId'],
        apartment_id: apartment.id,
        subscription_id: sub.id,
        user_id: sub.userId,
        distance: sub.distance,
      }
      notifications.push(obj)
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
        })
      }
    })
    await DAO.SubscriptionNotificationRecord.insertMany(notifications)

    // add into agendas
    // order notifications by member level
    const prms = notificationEnabled.map((item) => {
      if (item.priority === 0) {
        return agenda.now(CRON_JOBS.sendSubscriptionNotification, item)
      }
      return agenda.schedule(
        `in ${item.priority * 10} minutes`,
        CRON_JOBS.sendSubscriptionNotification,
        item
      )
    })
    await Promise.all(prms)

    return notificationEnabled
  }
}
