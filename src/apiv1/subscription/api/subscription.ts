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
import { TSubCondition } from '@/types'
import { toCamelCase } from '@/utils'
import { ObjectId } from 'bson'

type IAddSubBody = {
  coordinates: [number, number]
  city: string
  radius: number
  conditions: TSubCondition[]
} & (
  | {
      address: string
      type: 'customLocation'
    }
  | {
      stationId: string
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
      console.warn(userId, data)
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
      console.warn('done')
    } catch (err) {
      if (err instanceof SubscriptionInvalidValue) {
        console.warn('invalid')
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
    await ins.update()
    ctx.body = {
      success: true,
      message: 'none',
    }
    return ctx
  }
}

export default SubscriptionController
