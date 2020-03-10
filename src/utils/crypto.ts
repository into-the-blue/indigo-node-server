import AES from 'crypto-js/aes'
import CryptoJS from 'crypto-js'
import JWT from 'jsonwebtoken'
import { randomBytes, createDecipheriv } from 'crypto'
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
const decrypt = (message: string): object | string | number => {
  const result = AES.decrypt(message, secret).toString(CryptoJS.enc.Utf8)
  return JSON.parse(result)
}
export const Crypto = {
  encrypt,
  decrypt,
}

export const Jwt = {
  sign: (payload: string | object | Buffer, expiresIn: string = '1d') => {
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

  generateTokens: (userId: string) => ({
    accessToken: Jwt.sign(
      {
        userId,
      },
      '2h'
    ),
    refreshToken: Jwt.sign(
      {
        userId,
      },
      '14d'
    ),
  }),
}

export class WechatMpDecryptor {
  constructor(public appId: string, public sessionKey: string) {}

  decrypt = (encryptedData: string, iv: string) => {
    try {
      const decode = (str: string) => CryptoJS.enc.Base64.parse(str).toString()
      const sessionKey = decode(this.sessionKey)
      encryptedData = decode(encryptedData)
      iv = decode(iv)
      const message = CryptoJS.AES.decrypt(encryptedData, sessionKey, {
        iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      })
      console.warn('message', message.toString(CryptoJS.enc.Utf8))
      return JSON.parse(message.toString(CryptoJS.enc.Utf8))
    } catch (err) {
      console.warn(err)
    }
  }

  decryptData = (encryptedData: string, iv: string) => {
    const sessionKey = Buffer.from(this.sessionKey, 'base64')
    const _encryptedData = Buffer.from(encryptedData, 'base64')
    const _iv = Buffer.from(iv, 'base64')
    let decoded: any
    try {
      // 解密
      const decipher = createDecipheriv('aes-128-cbc', sessionKey, _iv)
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true)
      decoded = decipher.update(_encryptedData, 'binary', 'utf8')
      decoded += decipher.final('utf8')

      decoded = JSON.parse(decoded)
    } catch (err) {
      throw err
    }

    if (decoded.watermark.appid !== this.appId) {
      throw new Error('Illegal Buffer')
    }
    return decoded
  }
}
