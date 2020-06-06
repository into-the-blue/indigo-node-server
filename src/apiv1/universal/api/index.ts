import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Ctx,
  Authorized,
  NotFoundError,
} from 'routing-controllers';
import { response, RESP_CODES } from '@/utils';

@JsonController()
export class UniversalController {
  @Get('/universal/banners')
  getBanners() {
    return response(RESP_CODES.OK, undefined, [
      {
        imgUrl:
          'https://indigo.oss-cn-hangzhou.aliyuncs.com/banners/20-06-06.png',
        type: 'free_membership',
        width: 750,
        height: 225,
      },
    ]);
  }
}
