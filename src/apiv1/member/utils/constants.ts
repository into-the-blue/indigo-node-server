import { MemberInfoEntity } from '@/db/entities';

export const MAXIMUM_REDEEM_TIMES_PER_MONTH = 2;

export const AVAILABLE_MEMBER_SOURCE = [
  'purchase',
  'gift',
  'activity',
  'monthly_activity',
];

export const AVAILABLE_MEMBER_TYPES = ['5', '14', '30'];

export const MEMBER_QUOTA: {
  [key: string]: Pick<
    MemberInfoEntity,
    | 'emailEnable'
    | 'emailNotifyQuota'
    | 'notificationEnable'
    | 'smsEnable'
    | 'smsNotifyQuota'
    | 'subscriptionQuota'
    | 'wechatEnable'
    | 'wechatNotifyQuota'
  > & {
    period: number;
  };
} = {
  5: {
    emailEnable: true,
    emailNotifyQuota: 10,
    notificationEnable: true,
    smsEnable: true,
    smsNotifyQuota: 5,
    subscriptionQuota: 5,
    wechatEnable: true,
    wechatNotifyQuota: 20,
    period: 5,
  },
  14: {
    emailEnable: true,
    emailNotifyQuota: 10 * 3,
    notificationEnable: true,
    smsEnable: true,
    smsNotifyQuota: 5 * 3,
    subscriptionQuota: 10,
    wechatEnable: true,
    wechatNotifyQuota: 20 * 3,
    period: 14,
  },
  30: {
    emailEnable: true,
    emailNotifyQuota: 10 * 6,
    notificationEnable: true,
    smsEnable: true,
    smsNotifyQuota: 5 * 6,
    subscriptionQuota: 15,
    wechatEnable: true,
    wechatNotifyQuota: 20 * 6,
    period: 14,
  },
  friend: {
    emailEnable: true,
    emailNotifyQuota: -1,
    notificationEnable: true,
    smsEnable: true,
    smsNotifyQuota: 30 * 5,
    subscriptionQuota: -1,
    wechatEnable: true,
    wechatNotifyQuota: -1,
    period: 365 * 10,
  },
  sponsor: {
    emailEnable: true,
    emailNotifyQuota: 30 * 5,
    notificationEnable: true,
    smsEnable: true,
    smsNotifyQuota: 30 * 2,
    subscriptionQuota: 15,
    wechatEnable: true,
    wechatNotifyQuota: 30 * 3,
    period: 365,
  },
  lifelongMember: {
    emailEnable: true,
    emailNotifyQuota: -1,
    notificationEnable: true,
    smsEnable: true,
    smsNotifyQuota: -1,
    subscriptionQuota: -1,
    wechatEnable: true,
    wechatNotifyQuota: -1,
    period: 365 * 10,
  },
};
