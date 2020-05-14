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
import { response, RESP_CODES } from '@/utils'
@Authorized()
@JsonController()
export default class UserController {
  @Get('/users/info')
  async getUserInfo(@Ctx() ctx: Koa.Context) {
    const { userId } = ctx.user
    const user = await Mongo.DAO.User.findOne(userId)
    if (!user) throw new NotFoundError()
    ctx.body = response(RESP_CODES.OK, undefined, user)
    return ctx
  }
}
