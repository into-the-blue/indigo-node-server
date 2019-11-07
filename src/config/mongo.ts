/*
 * File: /Users/origami/Desktop/templates/node-express-template/src/config/moongo.ts
 * Project: /Users/origami/Desktop/templates/node-express-template
 * Created Date: Friday July 12th 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Friday July 12th 2019 3:18:06 pm
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
import mongoose, { Schema, Model, Document } from 'mongoose';
import { ObjectId } from 'bson';

const ApartmentSchema = new Schema({
  _id: { type: ObjectId },
  type: { type: String },
  title: { type: String },
  created_at: { type: String, index: true },
  house_code: { type: String, index: true },
  house_id: { type: String, index: true },
  city_abbreviation: { type: String },
  img_urls: { type: Array },
  price: { type: Number },
  tags: { type: Array },
  house_type: { type: String },
  area: { type: Number },
  orient: { type: String },
  broker_name: { type: String },
  broker_contact: { type: String },
  minimal_lease: { type: String },
  maximal_lease: { type: String },
  floor: { type: String },
  building_total_floors: { type: String },
  carport: { type: String },
  electricity_type: { type: String },
  check_in_date: { type: String },
  reservation: { type: String },
  elevator: { type: String },
  water: { type: String },
  gas: { type: String },
  television: { type: Number },
  fridge: { type: Number },
  washing_machine: { type: Number },
  air_condition: { type: Number },
  water_heater: { type: Number },
  bed: { type: Number },
  heating: { type: Number },
  wifi: { type: Number },
  closet: { type: Number },
  natural_gas: { type: Number },
  transportations: { type: Array },
  community_deals: { type: String },
  house_description: { type: String },
  house_url: { type: String },
  city: { type: String },
  district: { type: String },
  bizcircle: { type: String },
  community_name: { type: String },
  community_url: { type: String },
  price_per_square_meter: { type: Number },
  broker_brand: { type: String },
  floor_accessibility: { type: Number },
  subway_accessibility: { type: Number },
  image_downloaded: { type: Boolean },
  geo_info: { type: Object },
  lat: { type: Number },
  lng: { type: Number },
  line_ids: { type: Array },
  station_ids: { type: Array },
  created_time: { type: Date, index: true },
  updated_time: { type: Date, index: true },
});
ApartmentSchema.index({ created_at: -1 });
const StationSchema = new Schema({
  _id: { type: ObjectId },
  station_id: { type: Number, index: true },
  line_id: { type: Number },
  station_name: { type: String },
  url: { type: String },
  line_ids: { type: Array },
  urls: { type: Array },
  city: { type: String },
});

const LineSchema = new Schema({
  _id: { type: ObjectId },
  line_id: { type: Number, index: true },
  line_name: { type: String },
  url: { type: String },
  city: { type: String },
});

ApartmentSchema.pre('update', next => {});

const _find = (document: Model<Document>) => (
  condition: any,
): Promise<Document[]> =>
  new Promise((resolve, reject) => {
    document.find(condition, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
class _Mongo {
  ApartmentModel: Model<Document>;
  StationModel: Model<Document>;
  LineModel: Model<Document>;
  constructor() {
    this._init();
  }
  _init = async () => {
    const mongo = await this.connect();
    this.ApartmentModel = mongo.model('apartments', ApartmentSchema);
    this.StationModel = mongo.model('stations', StationSchema);
    this.LineModel = mongo.model('lines', LineSchema);
  };
  connect = async () => {
    const {
      MONGO_USERNAME,
      MONGO_PASSWORD,
      MONGO_HOST,
      MONGO_DB,
    } = process.env;
    return await mongoose.createConnection(
      `mongodb://${MONGO_HOST}:27017/${MONGO_DB}?authSource=admin`,
      {
        pass: MONGO_PASSWORD,
        user: MONGO_USERNAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
  };
  findApartment = (condition: any) => _find(this.ApartmentModel)(condition);
  findLines = (condition: any) => _find(this.LineModel)(condition);
  findStations = (condition: any) => _find(this.StationModel)(condition);
}

export const Mongo = new _Mongo();
