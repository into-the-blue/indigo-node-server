import Koa from 'koa'
import { useKoaServer } from 'routing-controllers'
import graphql from './graphql'
import ApartmentController from './apartments'
export const setupDashBoard = (app: Koa<Koa.DefaultState, Koa.Context>) => {
  app.use(graphql())
  useKoaServer(app, {
    routePrefix: '/dashboard/api/v1',
    controllers: [ApartmentController],
  })
}
