import { ApolloServer, gql, Config } from 'apollo-server-koa'
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql'
import { from } from 'rxjs'
import { getMongoRepository } from 'typeorm'
import { Mongo } from '@/db'
import { sleep, toCamelCase } from '@/utils'
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
    minimalLease: String
    maximalLease: String
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
    brokerBrand: String
    floorAccessibility: Int
    subwayAccessibility: Int
    lat: Float
    lng: Float
    lineIds: [Int]
    stationIds: [Int]
    createdTime: String
    updatedTime: String
  }

  type Query {
    wallo: String
    fetchApartments: [Apartment]
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    wallo: async () => {
      await sleep(1000)
      return 'Hello world!'
    },
    fetchApartments: async () => {
      const data = await Mongo.DAO.Apartment.find({ take: 50 })
      return data.map(toCamelCase)
    },
  },
}
const apolloConfig: Config = {
  resolvers,
  typeDefs,
  // schema,
}
const server = new ApolloServer(apolloConfig)
const middleware = () =>
  server.getMiddleware({
    path: '/dashboard/graphql',
  })
export default middleware
