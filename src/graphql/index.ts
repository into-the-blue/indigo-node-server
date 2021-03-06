import { ApolloServer, gql, Config } from 'apollo-server-koa'
import {} from 'rxjs'
import {} from 'typeorm'
import {} from '@/utils'
import { graphqlConfig } from '../config'
import * as Resolvers from './resolvers'

// Construct a schema, using GraphQL schema language
export const typeDefs = gql`
  type LabeledApartment {
    id: ID
    apartmentId: ID
    houseId: String
    decoration: String
  }

  type AddrInfoNeighborhood {
    name: [String]
    type: [String]
  }

  type AddrInfo {
    formattedAddress: String
    country: String
    province: String
    citycode: String
    city: String
    district: String
    township: [String]
    neighborhood: AddrInfoNeighborhood
    location: String
    level: String
  }

  type GeoInfo {
    status: String
    info: String
    infocode: String
    count: String
    geocodes: [AddrInfo]
  }

  type Computed {
    rankingOfPPSM: Int
    rankingOfPrice: Int
    rankingOfArea: Int
    averagePPSM: Float
    averagePrice: Float
    averageArea: Float
    medianPPSM: Float
    medianPrice: Float
    medianArea: Float
    lowestPPSM: String
    lowestPrice: String
    total: Int
    updatedAt: String
    range: Int
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
    lineIds: [String]
    stationIds: [String]
    createdTime: String
    updatedTime: String
    computed: Computed
    labeled: [LabeledApartment]
    distance: Float
  }

  type Station {
    id: ID
    stationId: String
    stationName: String
    url: String
    city: String
    lineId: String
    lineIds: [String]
    urls: [String]
    coordinates: [Float]
    lines: [Line]
    distance: Float
  }

  type Line {
    id: ID
    lineName: String
    lineId: String
    url: String
    city: String
  }

  type queryByAddressResp {
    coordinates: [Float]
    apartments: [Apartment]
  }

  type Query {
    queryApartments(id: Int!): [Apartment]
    queryApartmentsWithoutLabel(limit: Int!): [Apartment]
    queryApartmentsWithLabel(limit: Int!): [Apartment]
    queryApartmentsNearby(id: ID!, radius: Int!, limit: Int!): [Apartment]
    queryApartmentsNearbyCoordinates(coordinates: [Float]!, radius: Int!, limit: Int!): [Apartment]

    queryApartmentsNearbyAddress(
      address: String!
      city: String!
      radius: Int!
      limit: Int!
    ): queryByAddressResp

    queryApartmentsNearbyStation(
      stationId: String!
      radius: Int!
      limit: Int!
    ): [Apartment]

    queryStations: [Station]

    queryStationsNearbyCoordinates(
      coordinates: [Float]!
      radius: Int!
    ): [Station]
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    ...Resolvers,
  },
}
const apolloConfig: Config = {
  ...graphqlConfig,
  resolvers,
  typeDefs,
  // introspection: process.env.NODE_ENV === 'dev',
  // schema,
}
const server = new ApolloServer(apolloConfig)

const middleware = () =>
  server.getMiddleware({
    path: '/graphql',
  })
export default middleware
