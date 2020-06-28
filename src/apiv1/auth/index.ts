import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Ctx,
} from 'routing-controllers';
import Koa from 'koa';
import { Mongo } from '@/db';
import Axios from 'axios';
import { WechatMpDecryptor, Jwt, Crypto, response, RESP_CODES } from '@/utils';

const MP_APP_ID = process.env.INDIGO_MP_APP_ID;
const MP_SECRET = process.env.INDIGO_MP_SECRET;

@JsonController()
export default class UserController {
  @Post('/auth/login')
  async login(@Ctx() ctx: Koa.Context, @Body() body: any) {
    const { type } = body;
    if (type === 'wechat_mp') {
      const { code } = body;
      const { data } = await Axios.get(
        'https://api.weixin.qq.com/sns/jscode2session',
        {
          params: {
            appid: MP_APP_ID,
            secret: MP_SECRET,
            js_code: code,
            grant_type: 'authorization_code',
          },
        }
      );
      const { session_key, openid } = data;
      ctx.body = response(RESP_CODES.OK, undefined, {
        sessionKey: session_key,
      });
    }
    return ctx;
  }
  /**
   *
   *
   * @param {Koa.Context} ctx
   * @param {{
   *       encryptedData: string
   *       iv: string
   *       sessionKey: string
   *     }} body
   * @returns
   * @memberof UserController
   *
   *
   *       avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLVqgbS8xic3kVicibwk1OzSoVjdTkPClOiap1hTiboTpwUH8ro0R3wfnyJLeUqpA4A5wGSfUXIxVT664A/132"
   *       city: "Wuxi"
   *       country: "China"
   *       gender: 1
   *       language: "zh_CN"
   *       nickName: "Rick 杨同学"
   *       openId: "o-k
   *       province: "Jiangsu"
   *       unionId: "oYRi5w"
   *       watermark: {timestamp: 1583373792, appid: ""}
   */
  @Post('/auth/wechat_auth')
  async wechatAuth(
    @Ctx() ctx: Koa.Context,
    @Body()
    body: {
      encryptedData: string;
      iv: string;
      sessionKey: string;
    }
  ) {
    const { encryptedData, iv, sessionKey } = body;
    try {
      const decoder = new WechatMpDecryptor(MP_APP_ID, sessionKey);
      const decodedData = decoder.decryptData(encryptedData, iv);
      const {
        avatarUrl,
        city,
        country,
        gender,
        language,
        nickName,
        openId,
        province,
        unionId,
      } = decodedData;

      const existed = await Mongo.DAO.User.findOne({
        where: {
          'auth_data.unionId': unionId,
        },
      });

      const userData = {
        username: nickName,
        gender,
        country,
        avatar: avatarUrl,
        city,
        province,
        language,
        updated_at: new Date(),
      };
      let userId: string;
      if (!existed) {
        userId = (
          await Mongo.DAO.User.insertOne({
            ...userData,
            auth_data: {
              unionId,
              openId,
            },
            created_at: new Date(),
          })
        ).insertedId.toString();
      } else {
        userId = existed.id.toString();
        await Mongo.DAO.User.updateOne(
          {
            'auth_data.unionId': unionId,
          },
          {
            $set: {
              ...userData,
            },
          }
        );
      }
      ctx.body = response(RESP_CODES.OK, undefined, {
        userInfo: {
          username: userData.username,
          gendaer: userData.gender,
          avatar: userData.avatar,
        },
        ...Jwt.generateTokens(userId),
        isNew: !existed,
      });

      return ctx;
    } catch (err) {
      ctx.status = 500;
      ctx.message = err.message;
      return ctx;
    }
  }

  @Post('/auth/refresh')
  async refresh(
    @Ctx() ctx: Koa.Context,
    @Body() body: { refreshToken: string }
  ) {
    const { refreshToken } = body;
    const { err, result } = await Jwt.verify(refreshToken);
    if (err) {
      ctx.body = response(RESP_CODES.ACCESS_TOKEN_EXPIRED);
      return ctx;
    }
    const { userId } = Crypto.decrypt(result['token']) as any;
    return response(RESP_CODES.OK, undefined, {
      ...Jwt.generateTokens(userId),
    });
  }
}
