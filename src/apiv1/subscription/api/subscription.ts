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
import { Subscription } from '../model/subscription'
import { Context } from 'koa'

@Authorized()
@JsonController()
class SubscriptionController {
  @Post()
  async addSubscription(@Body() body: any, @Ctx() ctx: Context) {
    const sub = new Subscription({
      ...body,
      userId: ctx.user.userId,
    })
  }

  @Put()
  async updateSubscription(@Body() body: any) {}
}

export default SubscriptionController
