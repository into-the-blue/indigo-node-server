/*
 * File: /Users/origami/Desktop/templates/node-express-template/src/app.ts
 * Project: /Users/origami/Desktop/templates/node-express-template
 * Created Date: Friday July 12th 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Friday July 12th 2019 3:25:43 pm
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
import 'reflect-metadata';
import Koa from 'koa';
import { useKoaServer } from 'routing-controllers';
import ApiV1Controller from './apiv1';
const PORT = 7000;
const LIMIT = '3mb';
const app = new Koa();

// const start ={ request:
//   { method: 'GET',
//     url: '/api/v1',
//     header:
//      { host: 'localhost:7000',
//        accept:
//         'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//        'upgrade-insecure-requests': '1',
//        cookie:
//         'username-localhost-8888="2|1:0|10:1572515075|23:username-localhost-8888|44:NGY2YWMyMTJmZDZjNGE0N2E4ZWJiYWIxY2NlZjljOGY=|6e86bb098c37f264f1656eae5687f652f3f3641081c957cbb2dc0b74d202daba"; username-localhost-8889="2|1:0|10:1572397923|23:username-localhost-8889|44:ZWUxMTI4YzEzZDE3NGVkN2E5OTEwMTFmMzNiMWU4ZmI=|678b6cf1273ccaf6a3649620b5ba5d7bdbe7fdd0b5266184a1c34ad75b71d573"; _xsrf=2|2b354c5d|3a9d4c95489cb66ad2a6d9c0c60ab653|1570672193; mp_3c0d3b2524f8fa595f5086b110738bfc_mixpanel=%7B%22distinct_id%22%3A%20%22167cb47ed1647d-06a0403ffdc5168-481f3700-13c680-167cb47ed17708%22%2C%22%24device_id%22%3A%20%22167cb47ed1647d-06a0403ffdc5168-481f3700-13c680-167cb47ed17708%22%2C%22%24initial_referrer%22%3A%20%22http%3A%2F%2Flocalhost%3A8080%2Fwebpack-dev-server%2F%22%2C%22%24initial_referring_domain%22%3A%20%22localhost%3A8080%22%7D',
//        'user-agent':
//         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15',
//        'accept-language': 'en-us',
//        'accept-encoding': 'gzip, deflate',
//        connection: 'keep-alive' } },
//  response:
//   { status: 404,
//     message: 'Not Found',
//     header: [Object: null prototype] {} },
//  app: { subdomainOffset: 2, proxy: false, env: 'development' },
//  originalUrl: '/api/v1',
//  req: '<original node req>',
//  res: '<original node res>',
//  socket: '<original node socket>' }

//  const end = { request:
//   { method: 'GET',
//     url: '/api/v1',
//     header:
//      { host: 'localhost:7000',
//        accept:
//         'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//        'upgrade-insecure-requests': '1',
//        cookie:
//         'username-localhost-8888="2|1:0|10:1572515075|23:username-localhost-8888|44:NGY2YWMyMTJmZDZjNGE0N2E4ZWJiYWIxY2NlZjljOGY=|6e86bb098c37f264f1656eae5687f652f3f3641081c957cbb2dc0b74d202daba"; username-localhost-8889="2|1:0|10:1572397923|23:username-localhost-8889|44:ZWUxMTI4YzEzZDE3NGVkN2E5OTEwMTFmMzNiMWU4ZmI=|678b6cf1273ccaf6a3649620b5ba5d7bdbe7fdd0b5266184a1c34ad75b71d573"; _xsrf=2|2b354c5d|3a9d4c95489cb66ad2a6d9c0c60ab653|1570672193; mp_3c0d3b2524f8fa595f5086b110738bfc_mixpanel=%7B%22distinct_id%22%3A%20%22167cb47ed1647d-06a0403ffdc5168-481f3700-13c680-167cb47ed17708%22%2C%22%24device_id%22%3A%20%22167cb47ed1647d-06a0403ffdc5168-481f3700-13c680-167cb47ed17708%22%2C%22%24initial_referrer%22%3A%20%22http%3A%2F%2Flocalhost%3A8080%2Fwebpack-dev-server%2F%22%2C%22%24initial_referring_domain%22%3A%20%22localhost%3A8080%22%7D',
//        'user-agent':
//         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15',
//        'accept-language': 'en-us',
//        'accept-encoding': 'gzip, deflate',
//        connection: 'keep-alive' } },
//  response:
//   { status: 200,
//     message: 'OK',
//     header:
//      [Object: null prototype] {
//        'content-type': 'application/json; charset=utf-8',
//        vary: 'Origin' } },
//  app: { subdomainOffset: 2, proxy: false, env: 'development' },
//  originalUrl: '/api/v1',
//  req: '<original node req>',
//  res: '<original node res>',
//  socket: '<original node socket>' }


app.use(async (ctx, next) => {
  ctx.body = 'hello word';
  await next();
});
useKoaServer(app, {
  cors: true,
  routePrefix: '/api/v1',
  controllers: [...ApiV1Controller],
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
