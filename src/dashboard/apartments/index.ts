import {
    JsonController,
    Param,
    Body,
    Get,
    Post,
    Ctx,
  } from 'routing-controllers'
  import Koa from 'koa'
  import { Mongo } from '../../db'
  
  @JsonController()
  export default class AparmentController {
    @Get('/update')
    async getAll(@Ctx() ctx: Koa.Context) {
      const res = await Mongo.DAO.Line.find({})
      // return res.length
      ctx.body = ctx.isAuthenticated()
      return res.length
    }
  
    @Get('/report/:id')
    getOne(@Param('id') id: number) {
      return 'hello'
    }
  
    @Post('/users')
    post(@Body() body: any, @Ctx() ctx: Koa.Context) {
      console.log(body)
      return 'success'
    }
  }
  