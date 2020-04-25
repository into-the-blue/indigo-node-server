import { camelCase, snakeCase } from 'lodash'
import Cluster from 'cluster'
import { ObjectId } from 'bson'
import { ObjectID } from 'mongodb'

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time))

const valuePreprocess = (value: any) => {
  if (value instanceof ObjectId) return value.toHexString()
  if (value instanceof ObjectID) return value.toHexString()
  return value
}

const toCase = (processor: Function) => <T>(obj: T): T => {
  if (obj === null || typeof obj === 'undefined') return obj
  if (typeof obj === 'string') {
    return processor(obj) as any
  }

  const SPECIFIC_OBJ_KEYS = ['computed']
  const recursively = (_obj: any): any => {
    if (Array.isArray(_obj)) return _obj.map(recursively)
    if (!isObject(_obj)) return _obj
    const tmp = {}
    Object.keys(_obj).forEach((key) => {
      if (SPECIFIC_OBJ_KEYS.includes(key)) {
        tmp[key] = _obj[key]
        return
      }
      const item = valuePreprocess(_obj[key])
      const processedKey = processor(key)

      if (Array.isArray(item)) {
        tmp[processedKey] = item.map(recursively)
      } else if (isObject(item)) {
        tmp[processedKey] = recursively(item)
      } else {
        tmp[processedKey] = item
      }
    })
    return tmp
  }

  if (isObject(obj)) return recursively(obj)

  return obj
}

export const toCamelCase = toCase(camelCase)

export const toSnakeCase = toCase(snakeCase)

export const isObject = (sth: any) => String(sth) === '[object Object]'

export const isMaster = () => {
  if (Cluster.isMaster) return true
  return Cluster.worker.id === 1
}

export const isDevEnv = () => {
  return process.env.NODE_ENV === 'dev'
}

export const isTestEnv = () => {
  return process.env.NODE_ENV === 'test'
}
