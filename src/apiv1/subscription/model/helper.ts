import { Mongo } from '@/db'
import { TSubCondition } from '@/types'
import { SubscriptionEntity, ApartmentEntity } from '@/db/entities'
import { toCamelCase } from '@/utils'

export const findSubscriptionsInRange = async (
  coordinates: [number, number]
): Promise<SubscriptionEntity[]> => {
  const data = await Mongo.DAO.Subscription.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: coordinates,
        },
        sipherical: true,
        distanceField: 'distance',
      },
    },
    {
      $redact: {
        $cond: {
          if: {
            $lte: ['$distance', '$radius'],
          },
          then: '$$KEEP',
          else: '$$PRUNE',
        },
      },
    },
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
