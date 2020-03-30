require('dotenv').config({
  path: Path.join(__dirname, '..', '..', '..', '..', 'test.env'),
})
import 'reflect-metadata'
require('module-alias/register')
import Path from 'path'
import { SubscriptionModel, findSubscriptionsInRange } from './subscription'
import { Mongo } from '@/db'
import { EXAMPLE_APARTMENT_DATA, EXAMPLE_SUBSCRIPTIONS_DATA } from './testData'
beforeAll(async done => {
  await Mongo.connect()
  done()
})
beforeEach(async done => {
  await Mongo.DAO.Apartment.deleteMany({})
  await Mongo.DAO.Subscription.deleteMany({})
  done()
})
test('should insert one subscription', async done => {
  const data = {
    coordinates: [121.485468, 31.227375],
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
  const ins = new SubscriptionModel({
    ...(data as any),
  })
  await ins.save()
  const res = await Mongo.DAO.Subscription.find({})
  const sub = res[0]
  expect(res.length).toBe(1)
  expect(sub.city).toBe(data.city)
  expect(sub.id).toBeDefined()
  expect(sub.payload).toEqual({
    stationId: data.stationId,
  })
  expect(sub.userId).toBeDefined()
  expect(sub.coordinates).toEqual(data.coordinates)
  expect(sub.type).toEqual(data.type)
  expect(sub.radius).toBe(data.radius)
  expect(sub.createdAt).toBeDefined()
  expect(sub.updatedAt).toBeDefined()

  done()
})

test('should pass validation', done => {
  const data = {
    coordinates: [121.485468, 31.227375],
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
  const instance = new SubscriptionModel({
    ...(data as any),
  })
  expect(instance.validate()).toBeTruthy()
  done()
})

test('should fail validation', done => {
  const data = {
    coordinates: [121.485468, 31.227375],
    type: 'metroStation',
    city: 'shanghai',
    radius: 500,
    // stationId: '5020043128392410',
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
  const instance = new SubscriptionModel({
    ...(data as any),
  })
  try {
    instance.validate()
  } catch (err) {
    expect(err.message).toMatch('Invalid Value')
  }
  done()
})

test('should update subscription', async done => {
  const data = {
    coordinates: [121.485468, 31.227375],
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
  const instance = new SubscriptionModel({
    ...(data as any),
  })
  const id = (await instance.save()).insertedId

  const toUpdate = {
    id,
    conditions: [
      {
        type: 'boolean',
        key: 'bed',
        condition: false,
      },
      {
        type: 'range',
        key: 'price',
        condition: [3000, 4000],
      },
    ],
  }
  const ins2 = new SubscriptionModel({
    ...(toUpdate as any),
  })
  await ins2.update()
  const res = await Mongo.DAO.Subscription.findOne(id)
  expect(res.conditions).toEqual(toUpdate.conditions)
  done()
})

test('should have subscriptions match', async done => {
  await Mongo.DAO.Apartment.insertOne(EXAMPLE_APARTMENT_DATA)
  await Mongo.DAO.Subscription.insertMany(EXAMPLE_SUBSCRIPTIONS_DATA)
  const apt = await Mongo.DAO.Apartment.findOne('5e1985789b56e63c965f91e2')
  const matched = await findSubscriptionsInRange(apt.coordinates)
  expect(matched.length).toBe(9)
  done()
})
