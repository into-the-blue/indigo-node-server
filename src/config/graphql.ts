import { Config } from 'apollo-server-koa'

const apolloConfig: Config = {
  playground: process.env.NODE_ENV === 'dev',
}

export default apolloConfig
