import {
  Authorized,
  JsonController,
  Post,
  Put,
  Get,
  Body,
  Ctx,
  Delete,
  QueryParams,
  InternalServerError,
} from 'routing-controllers'
import { Mongo } from '@/db'
import { SubscriptionModel } from '../model/subscription'
import { Context } from 'koa'
import { SubscriptionInvalidValue } from '../utils/errors'
import { TSubCondition, IMetroStation } from '@/types'
import { toCamelCase, RESP_CODES, response, logger } from '@/utils'
import { ObjectId } from 'bson'
import moment from 'moment'

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
  @Get('/subscription/notifications')
  async querySubscriptionNotificationRecords(
    @QueryParams() query: any,
    @Ctx() ctx: Context
  ) {
    const { id, skip } = query

    const records = await SubscriptionModel.findSubscriptionNotificationRecords(
      id,
      skip
    )
    return response(RESP_CODES.OK, undefined, records)
  }
  @Get('/subscription')
  async querySubscription(@QueryParams() query: any, @Ctx() ctx: Context) {
    const userId = ctx.user.userId
    const { lng, lat } = query
    const coordinates: [number, number] = lng && lat ? [+lng, +lat] : undefined
    try {
      const data = await SubscriptionModel.findSubscriptions(
        userId,
        coordinates ? { coordinates } : undefined
      )
      return response(RESP_CODES.OK, undefined, data)
    } catch (err) {
      logger.error(err)
      throw new InternalServerError(err.messa)
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
      ctx.body = response(RESP_CODES.OK)
    } catch (err) {
      if (err instanceof SubscriptionInvalidValue) {
        ctx.body = response(RESP_CODES.INVALID_INPUTS)
      } else {
        throw err
      }
    }
    return ctx
  }

  @Put('/subscription')
  async updateSubscription(@Body() body: any, @Ctx() ctx: Context) {
    if (!body.id) {
      ctx.body = response(
        RESP_CODES.VALUE_MISSING,
        'Subscription id is mandatory'
      )

      return ctx
    }
    const ins = new SubscriptionModel({
      ...body,
    })
    try {
      await ins.update()
      ctx.body = response(RESP_CODES.OK)

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
    ctx.body = response(RESP_CODES.OK, undefined, res)
    return ctx
  }

  @Post('/subscription/notify')
  async onNewApartment(@Body() body: any, @Ctx() ctx: Context) {
    const { apartment_id } = body
    if (!apartment_id) {
      ctx.body = response(RESP_CODES.INVALID_INPUTS)
      ctx.status = 400
      return ctx
    }
    try {
      const pushed = await SubscriptionModel.notify(apartment_id)
      ctx.body = response(RESP_CODES.OK, undefined, {
        notified: pushed.length,
      })
      return ctx
    } catch (err) {
      logger.error(err)
      throw new InternalServerError(err.message)
    }
  }
}

export default SubscriptionController
