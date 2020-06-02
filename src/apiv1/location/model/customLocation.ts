import { Mongo } from '@/db'
import { CustomLocationEntity } from '@/db/entities'

export class CustomLocationModel {
  static findCustomLocation = async (coordinates: [number, number]) => {
    return Mongo.DAO.CustomLocation.findOne({
      where: {
        coordinates,
      },
    })
  }

  static insertCustomLocationPOI = async (
    payload: Pick<
      CustomLocationEntity,
      'address' | 'city' | 'coordinates' | 'geoInfo' | 'name' | 'district'
    >
  ) => {
    const { address, city, coordinates, geoInfo, district, name } = payload
    const existing = await CustomLocationModel.findCustomLocation(coordinates)
    if (existing) return existing.id
    const res = await Mongo.DAO.CustomLocation.insertOne({
      address,
      city,
      coordinates,
      geo_info: geoInfo,
      alias: [address],
      created_at: new Date(),
      updated_at: new Date(),
      name,
      district,
      type: 'poi',
    })
    return res.insertedId
  }
}
