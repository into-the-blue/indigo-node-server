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
    const match = {
      $match: {
        subscription_id: new ObjectId(id),
        apartment_id: {
          $exists: true,
        },
      },
    }
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
    }
    const unwind = {
      $unwind: {
        path: '$apartment',
        preserveNullAndEmptyArrays: true,
      },
    }
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
    }
    const $skip = {
      $skip: +skip || 0,
    }
    const $limit = {
      $limit: 100,
    }
    const notificationRecords = await Mongo.DAO.SubscriptionNotificationRecord.aggregate(
      [match, lookupApartment, unwind, project, $skip, $limit]
    ).toArray()
    return response(
      RESP_CODES.OK,
      undefined,
      notificationRecords.map(toCamelCase)
    )
  }
  @Get('/subscription')
  async querySubscription(@QueryParams() query: any, @Ctx() ctx: Context) {
    const userId = ctx.user.userId
    const { coordinates } = query
    try {
      const match = {
        $match: {
          user_id: new ObjectId(userId),
          deleted: false,
        },
      }
      if (coordinates) {
        match.$match['coordinates'] = coordinates
      }
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
                  $gte: new Date(
                    moment().add(-1, 'month').format('YYYY-MM-DD')
                  ),
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
      }
      const project = {
        $project: {
          numOfNotificationRecords: {
            $size: '$notificationRecords',
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
      }
      const data = await Mongo.DAO.Subscription.aggregate([
        match,
        lookup,
        project,
      ]).toArray()
      return response(RESP_CODES.OK, undefined, data.map(toCamelCase), ctx)
    } catch (err) {
      console.warn(err)
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
