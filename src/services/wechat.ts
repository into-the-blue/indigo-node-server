import Axios from 'axios';

const WECHAT_APP_ID = process.env.INDIGO_MP_APP_ID;
const WECHAT_APP_SECRET = process.env.INDIGO_MP_SECRET;

export class WechatClient {
  static getAccessToken = async () => {
    const { data } = await Axios.get(
      'https://api.weixin.qq.com/cgi-bin/token',
      {
        params: {
          grant_type: 'client_credential',
          appid: WECHAT_APP_ID,
          secret: WECHAT_APP_SECRET,
        },
      }
    );
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  };

  /**
   *
   *
   * @static
   * @memberof WechatClient
   * 
   * @returns 
        {
          errcode: 43101,
          errmsg: 'user refuse to accept the msg hint: [yntVAa09284963]'
        }
        { errcode: 0, errmsg: 'ok' }
   */
  static sendMessage = async (
    accessToken: string,
    {
      openId,
      page,
      date,
      aparmentTitle,
    }: { openId: string; page: string; date: string; aparmentTitle: string }
  ) => {
    const { data } = await Axios.post(
      'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' +
        accessToken,
      {
        touser: openId,
        template_id: process.env.INDIGO_MP_TEMPLATE_ID,
        page,
        data: {
          thing1: {
            value: '为你找到新房源啦',
          },
          date3: {
            value: date,
          },
          thing4: {
            value: '尽快查看哦, 以免被抢走',
          },
          thing2: {
            value: aparmentTitle,
          },
        },
        //developer为开发版；trial为体验版；formal为正式版；默认为正式版
        miniprogram_state: 'formal',
      }
    );
    return data;
  };
}
