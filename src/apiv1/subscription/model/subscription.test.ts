require('dotenv').config({
  path: Path.join(__dirname, '..', '..', '..', '..', 'test.env'),
})
import 'reflect-metadata'
require('module-alias/register')
import Path from 'path'
import { Subscription } from './subscription'
import { Mongo } from '@/db'

beforeAll(async done => {
  await Mongo.connect()
  done()
})
beforeEach(async done => {
  await Mongo.DAO.Subscription.deleteMany({})
  done()
})
test('should insert one subscription', async done => {
  const data = {
    coordinate: [121.485468, 31.227375],
    type: 'metroStation',
    city: 'shanghai',
    radius: 500,
    stationId: '5020043128392410',
    userId: '5e64c11a7a189568b8525d27',
    conditions: [
      {
        type: 'range',
        key: 'price',
        condition: [-1, 5000],
      },
      {
        type: 'boolean',
        key: 'bed',
        condition: true,
      },
    ],
  }
  const ins = new Subscription({
    ...(data as any),
  })
  await ins.save()
  const res = await Mongo.DAO.Subscription.find({})
  expect(res.length).toBe(1)
  done()
})
