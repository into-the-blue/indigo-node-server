import { ApolloServer, gql, Config } from 'apollo-server-koa'
import {} from 'rxjs'
import {} from 'typeorm'
import {} from '@/utils'
import * as Resolvers from '@/graphql/resolvers'
import { typeDefs } from '@/graphql'

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    ...Resolvers,
  },
}
const apolloConfig: Config = {
  resolvers,
  typeDefs,
  playground: true,
  // introspection: process.env.NODE_ENV === 'dev',
  // schema,
}
const server = new ApolloServer(apolloConfig)
const middleware = () =>
  server.getMiddleware({
    path: '/dashboard/graphql',
  })
export default middleware
