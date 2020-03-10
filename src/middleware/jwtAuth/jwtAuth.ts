import { Crypto, Jwt } from '@/utils'
import passport from 'koa-passport'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'

export function setUpJwtAuth() {
  const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('Authentication'),
    secretOrKey: process.env.JWT_SECRET,
  }
  const jwtStrategy = new Strategy(options, (jwtPayload, done) => {
    try {
      const { access_token } = jwtPayload
      console.warn('accesstoken', access_token)
      const { userId } = Crypto.decrypt(access_token) as any
      if (userId) return done(null, userId)
      return done(null, null)
    } catch (err) {
      return done(err, null)
    }
  })
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    done(null, user)
  })
  passport.use(jwtStrategy)
}
