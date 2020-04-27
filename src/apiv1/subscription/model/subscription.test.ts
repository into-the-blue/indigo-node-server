require('dotenv').config({
  path: Path.join(__dirname, '..', '..', '..', '..', 'test.env'),
})
import 'reflect-metadata'
require('module-alias/register')
import Path from 'path'
import { SubscriptionModel } from './subscription'
import { findSubscriptionsInRange, handleConditions } from './helper'
import { Mongo } from '@/db'
import { EXAMPLE_APARTMENT_DATA, EXAMPLE_SUBSCRIPTIONS_DATA } from './testData'
import { TSubCondition } from '@/types'
import { toCamelCase } from '@/utils'
beforeAll(async (done) => {
  await Mongo.connect()
  done()
})
beforeEach(async (done) => {
  await Mongo.DAO.Apartment.deleteMany({})
  await Mongo.DAO.Subscription.deleteMany({})
  done()
})
test('should insert one subscription', async (done) => {
  const data = {
    coordinates: [121.485468, 31.227375],
    type: 'metroStation',
    city: 'shanghai',
    radius: 500,
    payload: {
      stationId: '5020043128392410',
    },
    address: '静安寺',
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
  expect(sub.address).toBe(data.address)
  expect(sub.payload).toEqual({
    stationId: data.payload.stationId,
  })
  expect(sub.userId).toBeDefined()
  expect(sub.coordinates).toEqual(data.coordinates)
  expect(sub.type).toEqual(data.type)
  expect(sub.radius).toBe(data.radius)
  expect(sub.createdAt).toBeDefined()
  expect(sub.updatedAt).toBeDefined()

  done()
})

test('should pass validation', (done) => {
  const data = {
    coordinates: [121.485468, 31.227375],
    type: 'metroStation',
    city: 'shanghai',
    radius: 500,
    address: '静安寺',
    payload: {
      stationId: '5020043128392410',
    },
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

test('should fail validation', (done) => {
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

test('should delete subscription', async (done) => {
  const data = {
    coordinates: [121.485468, 31.227375],
    type: 'metroStation',
    city: 'shanghai',
    radius: 500,
    address: '静安寺',
    payload: {
      stationId: '5020043128392410',
    },
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
  const id = await new SubscriptionModel(data as any).save()
  const res = await SubscriptionModel.delete(
    id.insertedId.toHexString(),
    data.userId
  )
  expect(res.success).toBe(true)
  expect(res.deletedCount).toBe(1)
  done()
})

test('should update subscription', async (done) => {
  const data = {
    coordinates: [121.485468, 31.227375],
    type: 'metroStation',
    city: 'shanghai',
    radius: 500,
    address: '静安寺',
    payload: {
      stationId: '5020043128392410',
    },
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

test('should have subscriptions matched in range', async (done) => {
  await Mongo.DAO.Apartment.insertOne(EXAMPLE_APARTMENT_DATA)
  await Mongo.DAO.Subscription.insertMany(EXAMPLE_SUBSCRIPTIONS_DATA)
  const apt = await Mongo.DAO.Apartment.findOne(
    EXAMPLE_APARTMENT_DATA._id.toHexString()
  )
  const matched = await findSubscriptionsInRange(apt.coordinates)
  expect(matched.length).toBe(9)
  done()
})

test('should pass condition check', (done) => {
  const apartment = toCamelCase(EXAMPLE_APARTMENT_DATA) as any
  const conditions: TSubCondition[] = [
    {
      type: 'range',
      key: 'price',
      condition: [-1, 4500],
      value: [1000, 4000],
    },
    {
      type: 'range',
      key: 'area',
      condition: [15, 20],
      value: [10, 100],
    },
  ]
  const conditions2: TSubCondition[] = [
    {
      type: 'range',
      key: 'pricePerSquareMeter',
      condition: [250, 300],
      value: [50, 300],
    },
  ]
  const conditions3: TSubCondition[] = [
    {
      type: 'range',
      key: 'price',
      condition: [-1, -1],
      value: [1000, 4000],
    },
  ]
  const res1 = handleConditions(conditions, apartment)
  const res2 = handleConditions(conditions2, apartment)
  const res3 = handleConditions(conditions3, apartment)
  expect(res1).toBeTruthy()
  expect(res2).toBeTruthy()
  expect(res3).toBeTruthy()
  done()
})

test('should fail condition check', (done) => {
  const apartment = toCamelCase(EXAMPLE_APARTMENT_DATA) as any
  const conditions: TSubCondition[] = [
    {
      type: 'range',
      key: 'price',
      condition: [3500, 4100],
      value: [1000, 4000],
    },
    {
      type: 'range',
      key: 'area',
      condition: [15, 20],
      value: [10, 100],
    },
  ]
  const conditions2: TSubCondition[] = [
    {
      type: 'range',
      key: 'pricePerSquareMeter',
      condition: [200, 250],
      value: [50, 1000],
    },
  ]
  const conditions3: TSubCondition[] = [
    {
      type: 'range',
      key: 'price',
      condition: [4510, 5000],
      value: [1000, 4000],
    },
  ]
  const res1 = handleConditions(conditions, apartment)
  const res2 = handleConditions(conditions2, apartment)
  const res3 = handleConditions(conditions3, apartment)
  expect(res1).toBeFalsy()
  expect(res2).toBeFalsy()
  expect(res3).toBeFalsy()
  done()
})
