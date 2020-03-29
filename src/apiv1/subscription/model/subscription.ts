import { Mongo } from '@/db'
import { ISubscription, TSubCondition, TSubscriptionPayload } from '@/types'
import { SubscriptionInvalidValue } from '../utils/errors'
type TInitialProps =
  | {
      coordinate: [number, number]
      type: 'metroStation'
      city: string
      radius: number
      stationId: string
      userId: string
      conditions: TSubCondition[]
    }
  | {
      coordinate: [number, number]
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
    return conditions.every(con => {
      if (con.type === 'range') {
        return con.condition.every(o => !isNaN(+o))
      }
      if (con.type === 'boolean') {
        return typeof con.condition === 'boolean'
      }
      return false
    })
  },
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

export class Subscription {
  instance: Omit<ISubscription, 'id' | 'createdAt' | 'updatedAt'>

  constructor(props: TInitialProps) {
    const {
      type,
      coordinate,
      city,
      radius,
      userId,
      conditions,
      ...restProps
    } = props
    this.instance = {
      type,
      coordinate,
      city,
      radius,
      userId,
      conditions,
      payload: {
        ...restProps,
      },
    }
  }

  validate = () => {
    const pass = Object.keys(this.instance).every(key =>
      validator[key](this.instance[key], this.instance)
    )
    if (!pass) throw new SubscriptionInvalidValue()
  }

  save = async () => {
    await Mongo.DAO.Subscription.insertOne(this.instance)
  }

  update = async () => {
    const toUpdate: any = {}
    Object.keys(this.instance).forEach(key => {
      if (this.instance[key]) {
        toUpdate[key] = this.instance[key]
      }
    })
    await Mongo.DAO.Subscription.updateOne(
      {
        _id: this.instance['id'],
      },
      {
        $set: toUpdate,
      }
    )
  }
}
