import { ApolloServer, gql, Config } from 'apollo-server-koa'
import {} from 'rxjs'
import {} from 'typeorm'
import {} from '@/utils'
import {
  queryApartments,
  queryApartmentsNearBy,
  queryApartmentsWithLabel,
  queryApartmentsWithoutLabel,
} from './resolvers'
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
    id: ID
    apartmentId: ID
    houseId: String
    decoration: String
  }

  type Location {
    lat: Float
    lng: Float
  }

  type GeoInfo {
    location: Location
    precise: Int
    confidence: Int
    comprehension: Int
    level: String
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
    floorFullInfo: String
    buildingTotalFloors: Int
    carport: String
    electricity: String
    checkInDate: String
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
    title: String
    naturalGas: Int
    transportations: [[String]]
    communityDeals: String
    houseDescription: String
    houseUrl: String
    city: String
    geoInfo: GeoInfo
    district: String
    bizcircle: String
    communityName: String
    communityUrl: String
    pricePerSquareMeter: Float
    floorAccessibility: Int
    subwayAccessibility: Int
    coordinates: [Float]
    coordtype: String
    lat: Float
    lng: Float
    lineIds: [Int]
    stationIds: [Int]
    createdTime: String
    updatedTime: String
    labeled: [LabeledApartment]
  }

  type Query {
    queryApartments(id: Int): [Apartment]
    queryApartmentsWithoutLabel(limit: Int): [Apartment]
    queryApartmentsWithLabel(limit: Int): [Apartment]
    queryApartmentsNearBy(id: ID, distance: Int, limit: Int): [Apartment]
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    queryApartments,
    queryApartmentsNearBy,
    queryApartmentsWithLabel,
    queryApartmentsWithoutLabel,
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
