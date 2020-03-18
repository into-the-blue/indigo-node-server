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
require('module-alias/register')
import 'reflect-metadata'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import session from 'koa-session'
import passport from 'koa-passport'
import cors from '@koa/cors'
import { useKoaServer } from 'routing-controllers'
import ApiV1Controller from './apiv1'
import { Mongo } from './db'
import graphqlMiddleware from './graphql'
import { createRateLimiter, setupPassport } from './middleware'
import { setupDashBoard } from './dashboard'
import { logger, randomString, isMaster } from './utils'
import StartCronJob from './cronJobs'
import Router from 'koa-router'
import helmet from 'koa-helmet'
import {} from 'rate-limiter-flexible'
// import cluster from 'cluster'

const NOT_FOUND_MSG = 'What are you looking for ?'
const router = new Router<Koa.DefaultState, Koa.Context>()
const rateLimiter = createRateLimiter()
const PORT = process.env.PORT || 7000

// cron job
StartCronJob()

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
  const requestId = randomString(10)
  try {
    console.time(requestId + ctx.url)
    await rateLimiter.consume(ctx.ip)
    await next()
  } catch (err) {
    if (err.remainingPoints === 0) {
      ctx.status = 429
      ctx.body = 'Too Many Requests'
      return
    }
    throw err
  } finally {
    console.timeEnd(requestId + ctx.url)
  }
})

//dashboard
setupDashBoard(app)

// graphql
app.use(graphqlMiddleware())

// app.use((ctx, next) => {
//   return passport.authenticate(
//     'jwt',
//     { session: false },
//     async (err, user, info, status) => {
//       try {
//         // console.log({
//         //   err,
//         //   user,
//         //   info,
//         //   status,
//         // })
//         await ctx.login(user)
//         ctx.user = user
//         await next()
//       } catch (err) {
//         console.log('errr', err.message)
//         ctx.status = 401
//         ctx.message = 'Unauthorized'
//         return ctx
//       }
//     }
//   )(ctx, next)
// })

app.use(router.routes())

// routing controller
useKoaServer(app, {
  routePrefix: '/api/v1',
  controllers: [...ApiV1Controller],
  authorizationChecker: (action, roles) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        'jwt',
        { session: false },
        async (err, user, info, status) => {
          try {
            if (err || !user) return resolve(false)
            await action.context.login(user)
            action.context.user = user
            resolve(true)
          } catch (err) {
            console.warn(err.message)
            resolve(false)
          }
        }
      )(action.context, action.next as any)
    })
  },
  // currentUserChecker: action => action.context.user,
})

app.listen(PORT, async () => {
  await Mongo.connect()
  logger.info(`server is running at http://localhost:${PORT}`)
})
