import { Mongo } from '@/db';
import { TMemberType, TMemberPurchaseSource } from '@/types';
import moment from 'moment';
import { ObjectId } from 'bson';
import {
  MEMBER_QUOTA,
  MAXIMUM_REDEEM_TIMES_PER_MONTH,
} from '../utils/constants';
import { Omit, toSnakeCase, toCamelCase } from '@/utils';
import { MemberInfoEntity } from '@/db/entities';
import { compareMemberType } from '../utils/util';
import {
  ExistingABetterMembership,
  ExceedFreeMembershipQuota,
} from '../utils/errors';

export class MembershipModel {
  static getMemberInfo = (userId: string) => {
    return Mongo.DAO.MemberInfo.findOne({
      where: {
        user_id: new ObjectId(userId),
      },
    });
  };

  static canRedeemFreeMemberShip = async (userId: string) => {
    const records = await Mongo.DAO.MemberTransactionRecord.find({
      where: {
        user_id: new ObjectId(userId),
        type: '5',
        source: 'monthly_activity',
        created_at: {
          $gte: new Date(moment().set('date', 1).format('YYYY-MM-DD')),
        },
      },
    });
    console.warn(records);
    return {
      enable: records.length < MAXIMUM_REDEEM_TIMES_PER_MONTH,
      remainingRedeemTimes: MAXIMUM_REDEEM_TIMES_PER_MONTH - records.length,
    };
  };

  static canPurchase = async (userId: string, type: TMemberType) => {
    const existing = await Mongo.DAO.MemberInfo.findOne({
      where: {
        user_id: new ObjectId(userId),
      },
    });
    if (!existing) return true;
    return compareMemberType(type, existing.type);
  };

  /**
   *
   *
   * @static
   * @memberof MemberShipModel
   *
   * when user has a existing, unexpired membership,
   * if purchased membership is inferior, throw error
   * if purchased membership is superior,
   * replace quota with better one, extend expiration date
   */
  static newMember = async (
    userId: string,
    type: TMemberType,
    source: TMemberPurchaseSource,
    price: number = 0,
    discount: number = 1
  ): Promise<MemberInfoEntity> => {
    const _userId = new ObjectId(userId);
    const existing = await Mongo.DAO.MemberInfo.findOne({
      where: {
        user_id: _userId,
      },
    });
    const quota = MEMBER_QUOTA[type];
    if (!quota) throw new Error('invalid member type');
    // cannot purchase a inferior membership
    if (existing && !compareMemberType(type, existing.type)) {
      throw new ExistingABetterMembership();
    }
    // if it's a free membership, check if this user can redeem it
    if (source === 'monthly_activity') {
      if (!(await MembershipModel.canRedeemFreeMemberShip(userId)).enable) {
        throw new ExceedFreeMembershipQuota();
      }
    }
    await Mongo.DAO.MemberTransactionRecord.insertOne({
      user_id: _userId,
      price,
      discount,
      type,
      source,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const payload = {
      ...toSnakeCase(Omit(quota, ['period'])),
      type,
      updated_at: new Date(),
    };
    if (!existing) {
      const member = {
        ...payload,
        created_at: new Date(),
        expire_at: moment().add(quota.period, 'day').toDate(),
        user_id: _userId,
      };
      const id = (await Mongo.DAO.MemberInfo.insertOne(member)).insertedId;
      return toCamelCase({
        ...member,
        id,
      }) as any;
    }
    const originExpireDay = moment(existing.expireAt);
    const nextExpireDay = (moment().isAfter(originExpireDay)
      ? moment()
      : originExpireDay
    )
      .add(quota.period, 'day')
      .toDate();
    await Mongo.DAO.MemberInfo.updateOne(
      {
        _id: existing.id,
      },
      {
        $set: {
          ...payload,
          expire_at: nextExpireDay,
        },
      }
    );
    return toCamelCase({
      ...existing,
      ...payload,
      expireAt: nextExpireDay,
    });
  };
}
