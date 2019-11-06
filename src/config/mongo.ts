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
import mongoose, { Schema } from 'mongoose';
import { ObjectId } from 'bson';

const mongo = mongoose.connect(
  `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`,
);
const ApartmentSchema = new Schema({
  _id: { type: ObjectId },
});

const StationSchema = new Schema({
  station_id: { type: Number },
  line_id: { type: Number },
  station_name: { type: String },
  url: { type: String },
  line_ids: { type: Array },
  urls: { type: Array },
  city: { type: String },
});
