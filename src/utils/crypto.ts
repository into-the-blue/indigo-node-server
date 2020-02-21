import AES from 'crypto-js/aes'
import CryptoJS from 'crypto-js'
import JWT from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { IJwtResponse } from '../types'
const secret = process.env.AES_SECRET
const jwtSecret = process.env.JWT_SECRET

const encrypt = (message: string | object | any[]) => {
  if (typeof message !== 'string') message = JSON.stringify(message)
  return AES.encrypt(message, secret).toString()
}

export const randomString = (size: number) => {
  if (size === 0) {
    throw new Error('Zero-length randomString is useless.')
  }

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789'
  let objectId = ''
  const bytes = randomBytes(size)

  for (let i = 0; i < bytes.length; ++i) {
    objectId += chars[bytes.readUInt8(i) % chars.length]
  }

  return objectId
}

export function randomHexString(size: number) {
  if (size === 0) {
    throw new Error('Zero-length randomHexString is useless.')
  }

  if (size % 2 !== 0) {
    throw new Error('randomHexString size must be divisible by 2.')
  }

  return randomBytes(size / 2).toString('hex')
}
const decrypt = (
  message: string,
  expected: 'object' | 'string' | 'number' = 'object'
): object | string | number => {
  const result = AES.decrypt(message, secret).toString(CryptoJS.enc.Utf8)
  return JSON.parse(result)
}
export const Crypto = {
  encrypt,
  decrypt,
}

export const Jwt = {
  sign: (payload: string | object | Buffer, expiresIn: string = '14d') => {
    return JWT.sign(payload, jwtSecret, {
      expiresIn,
    })
  },
  verify: (token: string): Promise<IJwtResponse> => {
    return new Promise(resolve => {
      JWT.verify(token, jwtSecret, (err, decoded) => {
        if (err)
          return resolve({
            success: false,
            err,
          })
        return resolve({
          success: true,
          result: decoded,
        })
      })
    })
  },
}
