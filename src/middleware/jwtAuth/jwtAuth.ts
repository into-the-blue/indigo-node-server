import { Crypto } from '@/utils'
import passport from 'koa-passport'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import {} from '@/db'

export function setUpJwtAuth() {
  const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  }
  const jwtStrategy = new Strategy(options, (jwtPayload, done) => {
    try {
      const { token } = jwtPayload
      // console.warn('accesstoken', access_token)
      const { userId } = Crypto.decrypt(token) as any
      if (userId) return done(null, { userId })
      return done(null, null)
    } catch (err) {
      return done(err, null)
    }
  })
  passport.serializeUser(async (userId: any, done) => {
    done(null, userId)
  })

  passport.deserializeUser(async (userId, done) => {
    // const user = await Mongo.DAO.User.findOne(userId)
    // console.warn('deseriai', userId, user)
    done(null, {
      userId,
    })
  })
  passport.use(jwtStrategy)
}
