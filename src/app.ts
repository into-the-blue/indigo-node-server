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
import 'reflect-metadata'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import session from 'koa-session'
import passport from 'koa-passport'
import cors from '@koa/cors'
import { useKoaServer } from 'routing-controllers'
import ApiV1Controller from '@/apiv1'
import { Mongo } from '@/db'
import { setupPassport } from '@/auth'
import { graphql } from '@/config'
import { createRateLimiter } from '@/middleware'
import { setupDashBoard } from '@/dashboard'
import Router from 'koa-router'
import helmet from 'koa-helmet'

const router = new Router<Koa.DefaultState, Koa.Context>()
const rateLimiter = createRateLimiter()
const PORT = process.env.PORT || 7000

const app = new Koa<Koa.DefaultState, Koa.Context>()
app.use(helmet())
app.use(cors())
app.use(bodyParser())
// session
app.keys = [process.env.SESSION_SECRET]
app.use(session({}, app))

// passport
setupPassport(app)
// limiter
app.use(async (ctx, next) => {
  try {
    console.time(ctx.url)
    await rateLimiter.consume(ctx.ip)
    await next()
  } catch (err) {
    console.log('errrrr', err)
    ctx.status = 429
    ctx.body = 'Too Many Requests'
  } finally {
    console.timeEnd(ctx.url)
  }
})

//dashboard
setupDashBoard(app)

// graphql
app.use(graphql())

router.get('/auth', (ctx, next) => {
  return passport.authenticate(
    'jwt',
    { session: true },
    async (err, user, info, status) => {
      console.log({
        err,
        user,
        info,
        status,
      })
      return await ctx.login(user)
      // ctx.body = 'ok';
    }
  )(ctx, next)
})
app.use(router.routes())

// routing controller
useKoaServer(app, {
  routePrefix: '/api/v1',
  controllers: [...ApiV1Controller],
})


app.listen(PORT, async () => {
  await Mongo.connect()
  console.log(`server is running at http://localhost:${PORT}`)
})
