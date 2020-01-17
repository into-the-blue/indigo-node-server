import { ApolloServer, gql, Config } from 'apollo-server-koa'
import {} from 'rxjs'
import {} from 'typeorm'
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
    id: ID
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
    title: String
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
    queryApartments(id: Int): [Apartment]
    queryApartmentsWithoutLabel(limit: Int): [Apartment]
    queryApartmentsWithLabel(limit: Int): [Apartment]
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    wallo: async () => {
      await sleep(1000)
      return 'Hello world!'
    },
    async queryApartments(parent, args, ctx) {
      logger.info(parent, args, ctx)
      const data = await Mongo.DAO.Apartment.find({
        take: 10,
        where: {
          title: {
            $exists: true,
          },
        },
      })
      return data.map(toCamelCase)
    },

    async queryApartmentsWithLabel(parent, args, ctx) {
      const { limit = 20 } = args
      const data = await Mongo.DAO.Apartment.aggregate([
        {
          $match: {
            title: {
              $exists: true,
            },
          },
        },
        {
          $lookup: {
            from: 'labeledApartments',
            localField: 'house_id',
            foreignField: 'house_id',
            as: 'labeled',
          },
        },
        {
          $match: {
            labeled: { $ne: [] },
          },
        },
        {
          $limit: limit,
        },
      ]).toArray()
      return data.map(toCamelCase)
    },
    // unlabeled data
    async queryApartmentsWithoutLabel(parent, args, ctx) {
      const { limit = 20 } = args
      const data = await Mongo.DAO.Apartment.aggregate([
        {
          $match: {
            title: {
              $exists: true,
            },
          },
        },
        {
          $lookup: {
            from: 'labeledApartments',
            localField: 'house_id',
            foreignField: 'house_id',
            as: 'labeled',
          },
        },
        {
          $match: {
            labeled: {
              $size: 0,
            },
          },
        },
        {
          $limit: limit,
        },
      ]).toArray()
      console.warn(data.map(toCamelCase).slice(0, 10))
      return data.map(toCamelCase)
    },
  },
}
const apolloConfig: Config = {
  resolvers,
  typeDefs,
  playground: process.env.NODE_ENV === 'dev',
  // introspection: process.env.NODE_ENV === 'dev',
  // schema,
}
const server = new ApolloServer(apolloConfig)
const middleware = () =>
  server.getMiddleware({
    path: '/dashboard/graphql',
  })
export default middleware
