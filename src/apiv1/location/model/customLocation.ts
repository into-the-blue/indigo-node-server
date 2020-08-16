import { Mongo, redisClient } from '@/db';
import { CustomLocationEntity } from '@/db/entities';
import moment from 'moment';
import { get } from 'lodash';
export class CustomLocationModel {
  static getCountOfNewApartments = async (
    cities: {
      name: string;
      value: string;
      defaultCoordinates: [number, number];
    }[]
  ) => {
    const match = {
      $match: {
        // use updated time instead of created_time
        updated_time: {
          $gte: new Date(moment().add(-1, 'days').toISOString()),
        },
      },
    };
    const group = {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
      },
    };
    const data = await Mongo.DAO.Apartment.aggregate([match, group]).toArray();
    const res = cities.map((item) => {
      const found = data.find(
        (o) => o._id.replace('市', '') === item.name.replace('市', '')
      );
      return {
        ...item,
        count: get(found, 'count', 0),
      };
    });
    return res;
  };

  static findCustomLocation = async (coordinates: [number, number]) => {
    return Mongo.DAO.CustomLocation.findOne({
      where: {
        coordinates,
      },
    });
  };

  static insertCustomLocationPOI = async (
    payload: Pick<
      CustomLocationEntity,
      'address' | 'city' | 'coordinates' | 'geoInfo' | 'name' | 'district'
    >
  ) => {
    const { address, city, coordinates, geoInfo, district, name } = payload;
    const existing = await CustomLocationModel.findCustomLocation(coordinates);
    if (existing) return existing.id;
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
    });
    return res.insertedId;
  };
}
