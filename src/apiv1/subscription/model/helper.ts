import { Mongo } from '@/db'
import {
  TSubCondition,
  TMemberType,
  TSubscriptionNotificationPriority,
} from '@/types'
import {
  SubscriptionEntity,
  ApartmentEntity,
  MemberInfoEntity,
  SubscriptionNotificationRecordEntity,
} from '@/db/entities'
import { toCamelCase } from '@/utils'
import moment from 'moment'

export const findSubscriptionsInRange = async (
  coordinates: [number, number]
): Promise<
  (SubscriptionEntity & {
    memberInfo: MemberInfoEntity
    notificationRecords: SubscriptionNotificationRecordEntity[]
    distance: number
  })[]
> => {
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
  // find records in this month
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
  return data.map(toCamelCase)
}

// bed [0, 1]
// carport ['暂无数据', '免费使用', '租用车位']
// closet [1, 0]
// electricity ['暂无数据', '商电', '民电']
// elevator ['有', '无', '暂无数据']
// fridge [1, 0]
// gas ['有', '暂无数据', '无']
// natural_gas [0, 1]
// heating [0, 1]
// television [0, 1]
// washing_machine [1, 0]
// water ['暂无数据', '商水', '民水']
// water_heater [0, 1]
// wifi [1, 0]
const mapApartmentValueToBoolean = (value: any) => {
  const FALSE_VALUES = [
    '商水',
    '商电',
    '暂无数据',
    0,
    '无',
    null,
    undefined,
    false,
  ]
  return !FALSE_VALUES.includes(value)
}

const SPECIFIC_KEYS = ['isApartment']

const _specificKeyHandler = {
  isApartment: (apartment: ApartmentEntity, condition: TSubCondition) => {
    return apartment.tags.includes('公寓')
  },
}

const _handleCondition = (apartment: ApartmentEntity) => (
  condition: TSubCondition
) => {
  const handler = _specificKeyHandler[condition.key]
  if (handler) return handler(apartment, condition)

  if (condition.type === 'range') {
    const value = apartment[condition.key] as number
    const con = [...condition.condition]
    if (con[1] === -1) {
      con[1] = 99999999
    }
    return value >= con[0] && value <= con[1]
  }
  if (condition.type === 'boolean') {
    return (
      mapApartmentValueToBoolean(apartment[condition.key]) ===
      condition.condition
    )
  }

  if (condition.type === 'text') {
    return apartment[condition.key] === condition.condition
  }
}

export const handleConditions = (
  conditions: TSubCondition[],
  apartment: ApartmentEntity
) => conditions.every(_handleCondition(apartment))

const _notificationEnable = (quota: number, used: number, enable: boolean) => {
  if (!enable) return false
  return quota === -1 || quota > used
}
export const handleMemberSetting = (
  setting: MemberInfoEntity,
  notificationRecords: SubscriptionNotificationRecordEntity[]
) => {
  const {
    smsEnable,
    emailEnable,
    wechatEnable,
    notificationQuota,
    smsNotifyQuota,
    emailNotifyQuota,
    wechatNotifyQuota,
  } = setting
  let wechatNotificationCount = 0
  let smsNotifyCount = 0
  let emailNotifyCount = 0

  if (notificationQuota === -1) {
    return {
      wechatNotifyEnable: true,
      emailNotifyEnable: true,
      smsNotifyEnable: true,
    }
  }
  if (notificationRecords.length >= notificationQuota) {
    return {
      wechatNotifyEnable: false,
      emailNotifyEnable: false,
      smsNotifyEnable: false,
    }
  }
  notificationRecords.forEach((record) => {
    if (record.wechatNotifyEnable) wechatNotificationCount += 1
    if (record.emailNotifyEnable) emailNotifyCount += 1
    if (record.smsNotifyEnable) smsNotifyCount += 1
  })
  return {
    wechatNotifyEnable: _notificationEnable(
      wechatNotifyQuota,
      wechatNotificationCount,
      wechatEnable
    ),
    emailNotifyEnable: _notificationEnable(
      emailNotifyQuota,
      emailNotifyCount,
      emailEnable
    ),
    smsNotifyEnable: _notificationEnable(
      smsNotifyQuota,
      smsNotifyCount,
      smsEnable
    ),
  }
}

export const mapMemberTypeToPriority = (
  type: TMemberType
): TSubscriptionNotificationPriority => {
  switch (type) {
    case 'friend': {
      return 0
    }
    case 'sponsor':
    case 'lifelongMember': {
      return 1
    }
    case '30': {
      return 2
    }
    case '14': {
      return 3
    }
    case '5': {
      return 4
    }
    default: {
      return 4
    }
  }
}
