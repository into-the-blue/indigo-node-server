import { camelCase, snakeCase } from 'lodash'
export const sleep = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time))

const toCase = (processor: Function) => <T>(obj: T): T => {
  if (obj === null || typeof obj === 'undefined') return obj
  if (typeof obj === 'string') {
    return processor(obj) as any
  }

  const recursively = (_obj: any): any => {
    const tmp = {}
    Object.keys(_obj).forEach(key => {
      const item = _obj[key]
      if (Array.isArray(item)) {
        tmp[processor(key)] = item.map(recursively)
      } else if (isObject(item)) {
        tmp[processor(key)] = recursively(item)
      } else {
        tmp[processor(key)] = item
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
