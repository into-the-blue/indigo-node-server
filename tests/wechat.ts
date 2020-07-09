import Path from 'path';
import 'reflect-metadata';
require('dotenv').config({
  path: Path.join(__dirname, '..', 'prod.env'),
});
require('module-alias/register');
import { sendWechatMessage } from '../src/cronJobs/helper';

(async () => {
  console.log(await sendWechatMessage('o-kW25DGsOD3YGN3usHY_TLY9Jpk', '测试'));
})();
