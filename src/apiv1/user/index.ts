import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Ctx,
  Authorized,
  UseBefore,
  Middleware,
  NotFoundError,
} from 'routing-controllers'
import Koa from 'koa'
import { Mongo } from '@/db'
import { response, RESP_CODES, toCamelCase } from '@/utils'
import { ObjectId } from 'bson'
@Authorized()
@JsonController()
export default class UserController {
  @Get('/users/info')
  async getUserInfo(@Ctx() ctx: Koa.Context) {
    const { userId } = ctx.user
    const match = {
      $match: {
        _id: new ObjectId(userId),
      },
    }
    const lookup = {
      $lookup: {
        from: 'memberInfos',
        localField: '_id',
        foreignField: 'user_id',
        as: 'memberInfo',
      },
    }
    const unwind = {
      $unwind: {
        path: '$memberInfo',
        preserveNullAndEmptyArrays: true,
      },
    }
    const project = {
      $project: {
        _id: 0,
        username: 1,
        real_name: 1,
        avatar: 1,
        phone_number: 1,
        gender: 1,
        country: 1,
        province: 1,
        city: 1,
        email: 1,
        language: 1,
        created_at: 1,
        updated_at: 1,
        memberInfo: { $ifNull: ['$memberInfo', null] },
      },
    }
    const user = (
      await Mongo.DAO.User.aggregate([match, lookup, unwind, project]).toArray()
    )[0]
    if (!user) throw new NotFoundError()
    ctx.body = response(RESP_CODES.OK, undefined, toCamelCase(user))
    return ctx
  }
}
