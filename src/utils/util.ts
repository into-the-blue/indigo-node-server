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
      if (String(_obj[key]) === '[object Object]') {
        tmp[processor(key)] = recursively(_obj[key])
      } else {
        tmp[processor(key)] = _obj[key]
      }
    })
    return tmp
  }

  if (String(obj) === '[object Object]') {
    return recursively(obj)
  }
  return obj
}

export const toCamelCase = toCase(camelCase)

export const toSnakeCase = toCase(snakeCase)
