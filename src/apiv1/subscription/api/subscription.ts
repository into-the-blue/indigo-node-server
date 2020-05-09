import {
  Authorized,
  JsonController,
  Post,
  Put,
  Get,
  Body,
  Ctx,
  Delete,
} from 'routing-controllers'
import { Mongo } from '@/db'
import { SubscriptionModel } from '../model/subscription'
import { Context } from 'koa'
import { SubscriptionInvalidValue } from '../utils/errors'
import { TSubCondition, IMetroStation } from '@/types'
import { toCamelCase, RESP_CODES } from '@/utils'
import { ObjectId } from 'bson'
import { DAO } from '@/db/mongo'

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
          deleted: false,
        },
      })
      ctx.body = {
        data: data.map(toCamelCase),
        success: true,
        message: 'none',
        code: RESP_CODES.OK,
      }
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
        code: RESP_CODES.OK,
      }
    } catch (err) {
      if (err instanceof SubscriptionInvalidValue) {
        ctx.body = {
          success: false,
          message: 'Invalid value',
          code: RESP_CODES.INVALID_INPUTS,
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
        code: RESP_CODES.VALUE_MISSING,
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
        code: RESP_CODES.OK,
      }
      return ctx
    } catch (err) {
      console.warn(err)
      throw err
    }
  }

  @Delete('/subscription')
  async deleteSubscription(@Body() body: any, @Ctx() ctx: Context) {
    const { id } = ctx.query
    const res = await SubscriptionModel.delete(id, ctx.user.userId)
    ctx.body = res
    return ctx
  }

  @Post('/subscription/notify')
  async onNewApartment(@Body() body: any, @Ctx() ctx: Context) {
    const { apartment_id } = body
    await SubscriptionModel.notify(apartment_id)
  }
}

export default SubscriptionController
