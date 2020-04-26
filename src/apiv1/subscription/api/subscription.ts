import {
  Authorized,
  JsonController,
  Post,
  Put,
  Get,
  Body,
  Ctx,
} from 'routing-controllers'
import { Mongo } from '@/db'
import { SubscriptionModel } from '../model/subscription'
import { Context } from 'koa'
import { SubscriptionInvalidValue } from '../utils/errors'
import { TSubCondition, IMetroStation } from '@/types'
import { toCamelCase } from '@/utils'
import { ObjectId } from 'bson'

type IAddSubBody = {
  coordinates: [number, number]
  city: string
  radius: number
  conditions: TSubCondition[]
  address: string
} & (
  | {
      type: 'customLocation'
      payload?: any
    }
  | {
      payload: IMetroStation
      type: 'metroStation'
    }
)
@Authorized()
@JsonController()
class SubscriptionController {
  @Get('/subscription')
  async querySubscription(@Body() body: any, @Ctx() ctx: Context) {
    const userId = ctx.user.userId
    try {
      const data = await Mongo.DAO.Subscription.find({
        where: {
          user_id: new ObjectId(userId),
        },
      })
      console.warn(data.map(toCamelCase))
      return data.map(toCamelCase)
    } catch (err) {
      console.warn(err)
      throw err
    }
  }

  @Post('/subscription')
  async addSubscription(@Body() body: IAddSubBody, @Ctx() ctx: Context) {
    const sub = new SubscriptionModel({
      ...body,
      userId: ctx.user.userId,
    })
    try {
      sub.validate()
      await sub.save()
      ctx.body = {
        success: true,
        message: 'none',
      }
    } catch (err) {
      if (err instanceof SubscriptionInvalidValue) {
        ctx.body = {
          success: false,
          message: 'Invalid value',
        }
      } else {
        throw err
      }
    }
    return ctx
  }

  @Put('/subscription')
  async updateSubscription(@Body() body: any, @Ctx() ctx: Context) {
    if (!body.id) {
      ctx.body = {
        success: false,
        message: 'Subscription id is mandatory',
      }
      return ctx
    }
    const ins = new SubscriptionModel({
      ...body,
    })
    try {
      await ins.update()
      ctx.body = {
        success: true,
        message: 'none',
      }
      return ctx
    } catch (err) {
      console.warn(err)
      throw err
    }
  }
}

export default SubscriptionController
