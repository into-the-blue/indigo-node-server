import {
  JsonController,
  Authorized,
  Post,
  Ctx,
  Body,
  InternalServerError,
  Get,
  QueryParam,
} from 'routing-controllers';
import { Context } from 'koa';
import {
  AVAILABLE_MEMBER_SOURCE,
  AVAILABLE_MEMBER_TYPES,
} from '../utils/constants';
import { response, RESP_CODES, toCamelCase, logger } from '@/utils';
import { MembershipModel } from '../model/membership';
import {
  ExistingABetterMembership,
  ExceedFreeMembershipQuota,
} from '../utils/errors';
import { TMemberType } from '@/types';

@Authorized()
@JsonController()
export class MembershipController {
  @Get('/member')
  async getMemberInfo(@Ctx() ctx: Context) {
    const { userId } = ctx.user;
    const info = await MembershipModel.getMemberInfo(userId);
    return response(RESP_CODES.OK, undefined, toCamelCase(info));
  }

  @Post('/member/new')
  async newMember(@Ctx() ctx: Context, @Body() body: any) {
    try {
      const { userId } = ctx.user;
      const { source, type } = body;
      if (
        !AVAILABLE_MEMBER_SOURCE.includes(source) ||
        !AVAILABLE_MEMBER_TYPES.includes(type)
      ) {
        return response(RESP_CODES.INVALID_INPUTS);
      }
      const memberInfo = await MembershipModel.newMember(userId, type, source);
      return response(RESP_CODES.OK, undefined, memberInfo);
    } catch (err) {
      logger.error('[newMember]', err);
      if (err instanceof ExistingABetterMembership) {
        return response(RESP_CODES.MEMBER_CANNOT_BUY_A_INFERIOR_MEMBERSHIP);
      }
      if (err instanceof ExceedFreeMembershipQuota) {
        return response(RESP_CODES.MEMBER_EXCEED_FREE_MEMBERSHIP_QUOTA);
      }
      throw new InternalServerError(err.message);
    }
  }

  @Get('/member/can_purchase')
  async canPurchase(
    @Ctx() ctx: Context,
    @QueryParam('type') type: TMemberType
  ) {
    const { userId } = ctx.user;
    const canPurchase = await MembershipModel.canPurchase(userId, type);
    if (canPurchase) return response(RESP_CODES.OK);
    return response(RESP_CODES.MEMBER_CANNOT_BUY_A_INFERIOR_MEMBERSHIP);
  }

  @Get('/member/promo')
  async getFreeMembershipInfo(@Ctx() ctx: Context) {
    const { userId } = ctx.user;
    const data = await MembershipModel.canRedeemFreeMemberShip(userId);
    console.warn(data)
    return response(RESP_CODES.OK, undefined, data);
  }
}
