import {
  ApolloServer,
  gql,
  Config,
  IResolversParameter,
} from 'apollo-server-koa'
import { from } from 'rxjs'
import { getMongoRepository } from 'typeorm'
import { Mongo } from '@/db'
import { sleep, toCamelCase, logger } from '@/utils'
// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'query',
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve: () => 'hello worlllld',
//       },
//     },
//   }),
// })
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type LabeledApartment {
    apartmentId: ID
    houseId: String
    decoration: String
  }

  type Apartment {
    id: ID
    type: String
    createdAt: String
    houseCode: String
    houseId: String
    cityAbbreviation: String
    imgUrls: [String]
    price: Int
    tags: [String]
    houseType: String
    area: Int
    orient: String
    lease: String
    floor: String
    buildingTotalFloors: Int
    carport: String
    electricityType: String
    checkInDate: String
    reservation: String
    elevator: String
    water: String
    gas: String
    television: Int
    fridge: Int
    washingMachine: Int
    airCondition: Int
    waterHeater: Int
    bed: Int
    heating: Int
    wifi: Int
    closet: Int
    naturalGas: Int
    transportations: [[String]]
    communityDeals: String
    houseDescription: String
    houseUrl: String
    city: String
    district: String
    bizcircle: String
    communityName: String
    communityUrl: String
    pricePerSquareMeter: Float
    floorAccessibility: Int
    subwayAccessibility: Int
    lat: Float
    lng: Float
    lineIds: [Int]
    stationIds: [Int]
    createdTime: String
    updatedTime: String
    labeled: [LabeledApartment]
  }

  type Query {
    wallo: String
    fetchApartments(id: Int): [Apartment]
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    wallo: async () => {
      await sleep(1000)
      return 'Hello world!'
    },
    async fetchApartments(parent, args, ctx) {
      logger.info(
        JSON.stringify(parent),
        JSON.stringify(args),
        JSON.stringify(ctx)
      )
      const data = await Mongo.DAO.Apartment.find({ take: 10 })
      return data.map(toCamelCase)
    },
  },
}
const apolloConfig: Config = {
  resolvers,
  typeDefs,
  playground: process.env.NODE_ENV === 'dev',
  introspection: process.env.NODE_ENV === 'dev',
  // schema,
}
const server = new ApolloServer(apolloConfig)
const middleware = () =>
  server.getMiddleware({
    path: '/dashboard/graphql',
  })
export default middleware
