import { Mongo } from '@/db'
import { logger, toCamelCase } from '@/utils'
import { ObjectID } from 'mongodb'

const _queryApartmeentsNearByCoordinates = async (
  coordinates: number[],
  distance: number,
  limit: number
) => {
  if (
    !(coordinates.length === 2 && coordinates.every(o => typeof o === 'number'))
  ) {
    throw new Error('Invalid coordinates')
  }

  if (typeof distance !== 'number') {
    throw new Error('Distance is madatory')
  }

  const data = await Mongo.DAO.Apartment.find({
    take: limit,
    where: {
      $query: {
        coordinates: {
          $near: {
            $geometry: { type: 'Point', coordinates: coordinates },
            $minDistance: 0,
            $maxDistance: distance,
          },
        },
      },
      $orderby: { created_time: -1 },
    },
  })
  return data.map(toCamelCase)
}

export const queryApartmentsNearBy = async (parent, args, ctx) => {
  const { id, distance = 500, limit = 50 } = args
  if (!id) throw new Error('Id is mandatory')
  const apartment = await Mongo.DAO.Apartment.findByIds([
    new ObjectID(id) as any,
  ])
  if (!apartment.length) throw new Error('Not found')
  const { coordinates } = apartment[0]
  return _queryApartmeentsNearByCoordinates(coordinates, distance, limit)
}

export const queryApartments = async (parent, args, ctx) => {
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
}

export const queryApartmentsWithLabel = async (parent, args, ctx) => {
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
}
// unlabeled data
export const queryApartmentsWithoutLabel = async (parent, args, ctx) => {
  const { limit = 20 } = args
  const data = await Mongo.DAO.Apartment.aggregate([
    {
      $match: {
        title: {
          $exists: true,
        },
        missingInfo: {
          $ne: false,
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
  return data.map(toCamelCase)
}

export const queryStations = async (parent, args, ctx) => {
  const data = await Mongo.DAO.Station.aggregate([
    {
      $lookup: {
        from: 'lines',
        foreignField: 'line_id',
        localField: 'line_ids',
        as: 'lines',
      },
    },
  ]).toArray()
  return data.map(toCamelCase)
}

export const queryApartmentsNearByStation = async (parent, args, ctx) => {
  const { stationId, distance = 500, limit = 50 } = args
  if (!stationId) throw new Error('Station id is madatory')
  console.warn(stationId, typeof stationId)
  const data = await Mongo.DAO.Station.findOne({
    where: {
      station_id: stationId,
    },
  })
  if (!data) throw new Error('Not found')
  return _queryApartmeentsNearByCoordinates(data.coordinates, distance, limit)
}

// export const queryApartmeentsNearByCoordinates = async (parent, args, ctx) => {}
