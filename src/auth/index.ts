import Koa from 'koa';
import passport from 'koa-passport';
import { setUpJwtAuth } from './jwtAuth';

export function setupPassport(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
  setUpJwtAuth();
  app.use(passport.initialize());
  app.use(passport.session());
  return app;
}
