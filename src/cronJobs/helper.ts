import { redisClient, Mongo } from '@/db';
import { WechatClient } from '@/services/wechat';
import moment from 'moment';

const getWechatAccessToken = async () => {
  const cached = await redisClient.get('wechatAccessToken');
  if (cached) return cached;
  const { accessToken, expiresIn } = await WechatClient.getAccessToken();
  await redisClient.set(
    'wechatAccessToken',
    accessToken,
    'EX',
    +expiresIn - 100
  );
  return accessToken;
};

export const sendWechatMessage = async (openId: string, message) => {
  const accessToken = await getWechatAccessToken();
  const res = await WechatClient.sendMessage(accessToken, {
    openId,
    page: '/pages/Profile/builder/index?source=notification',
    date: moment().format('YYYY-MM-DD HH:MM:SS'),
    aparmentTitle: message,
  });
  return +res.errcode === 0;
};
