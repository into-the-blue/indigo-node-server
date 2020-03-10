import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Ctx,
  Authorized,
} from 'routing-controllers'
import Koa from 'koa'
import { Mongo } from '@/db'
import Axios from 'axios'
import {} from '@/utils'

@Authorized()
@JsonController()
export default class UserController {

  
  @Get('/users')
  async getAll(@Ctx() ctx: Koa.Context) {
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
