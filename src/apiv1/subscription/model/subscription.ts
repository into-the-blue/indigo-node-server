import { Mongo } from '@/db'
import { ISubscription, TSubCondition, TSubscriptionPayload } from '@/types'
import { SubscriptionInvalidValue } from '../utils/errors'
import { toSnakeCase, toCamelCase } from '@/utils'
import { findSubscriptionsInRange, handleConditions } from './helper'
import { ObjectId } from 'bson'
type TInitialProps =
  | {
      id?: string
      coordinates: [number, number]
      type: 'metroStation'
      city: string
      radius: number
      stationId: string
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
  payload: (
    payload: TSubscriptionPayload,
    instance: Omit<ISubscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (instance.type === 'metroStation')
      return typeof payload['stationId'] === 'string'
    if (instance.type === 'customLocation')
      return typeof payload['address'] === 'string'
    return false
  },
}

export class SubscriptionModel {
  instance: Omit<ISubscription, 'id' | 'createdAt' | 'updatedAt'>

  constructor(props: TInitialProps) {
    const {
      type,
      coordinates,
      city,
      radius,
      userId,
      conditions,
      id,
      ...restProps
    } = props
    this.instance = {
      type,
      coordinates,
      city,
      radius,
      userId,
      conditions,
      payload: {
        ...restProps,
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

  static notify = async (apartmentId: string) => {
    const apartment = await Mongo.DAO.Apartment.findOne(apartmentId)
    const subsInRange = await findSubscriptionsInRange(apartment.coordinates)
    const matched = subsInRange.filter((sub) =>
      handleConditions(sub.conditions, apartment)
    )
    return matched
  }
}
