import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';
import JWT from 'jsonwebtoken';
import { IJwtResponse } from '../models';
const secret = process.env.AES_SECRET;
const jwtSecret = process.env.JWT_SECRET;

const encrypt = (message: string | object | any[]) => {
  if (typeof message !== 'string') message = JSON.stringify(message);
  return AES.encrypt(message, secret).toString();
};

const decrypt = (
  message: string,
  expected: 'object' | 'string' | 'number' = 'object',
): object | string | number => {
  const result = AES.decrypt(message, secret).toString(CryptoJS.enc.Utf8);
  if (expected === 'object') return JSON.parse(result);
  if (expected === 'number') return +result;
  return result;
};
export const Crypto = {
  encrypt,
  decrypt,
};

export const Jwt = {
  sign: (payload: string | object | Buffer, expiresIn: string = '1d') => {
    return JWT.sign(payload, jwtSecret, {
      expiresIn,
    });
  },
  verify: (token: string): Promise<IJwtResponse> => {
    return new Promise(resolve => {
      JWT.verify(token, jwtSecret, (err, decoded) => {
        if (err)
          return resolve({
            success: false,
            err,
          });
        return resolve({
          success: true,
          result: decoded,
        });
      });
    });
  },
};
