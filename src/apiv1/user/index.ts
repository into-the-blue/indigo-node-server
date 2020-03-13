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
} from 'routing-controllers'
import Koa from 'koa'
import { Mongo } from '@/db'
import {} from '@/utils'
@Authorized()
@JsonController()
export default class UserController {
  @Get('/users')
  async getAll(@Ctx() ctx: Koa.Context) {
    console.warn('aaa')
    // const res = await Mongo.DAO.Line.find({})
    ctx.body = ctx.isAuthenticated()
    return ctx
  }

  @Get('/users/:id')
  getOne(@Param('id') id: number) {
    return 'hello'
  }

  @Post('/users')
  post(@Body() body: any, @Ctx() ctx: Koa.Context) {
    console.log(body)
    return 'success'
  }
}
