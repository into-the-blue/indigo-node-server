import { Context } from 'koa';

export enum RESP_CODES {
  OK = 1,
  VALUE_MISSING = 101,
  INVALID_INPUTS = 102,
  ACCESS_TOKEN_EXPIRED = 201,
  NOT_FOUND = 404,
  MEMBER_CANNOT_BUY_A_INFERIOR_MEMBERSHIP = 301,
  MEMBER_EXCEED_FREE_MEMBERSHIP_QUOTA = 302,
}
const RESPONSE_MESSAGES = {
  [RESP_CODES.OK]: 'ok',
  [RESP_CODES.VALUE_MISSING]: 'missing inputs',
  [RESP_CODES.INVALID_INPUTS]: 'invalid inputs',
  [RESP_CODES.ACCESS_TOKEN_EXPIRED]: 'access token expired',
  [RESP_CODES.NOT_FOUND]: 'not found',
  [RESP_CODES.MEMBER_CANNOT_BUY_A_INFERIOR_MEMBERSHIP]:
    'cannot buy a inferior membership',
  [RESP_CODES.MEMBER_EXCEED_FREE_MEMBERSHIP_QUOTA]:
    'exceed free membership quota',
};

export function response<T>(
  code: RESP_CODES,
  message?: string | null,
  data?: T
): { code: RESP_CODES; success: boolean; message: string; data: T };
export function response<T>(
  code: RESP_CODES,
  message?: string | null,
  data?: T,
  ctx?: Context
): Context;
export function response<T>(
  code: RESP_CODES,
  message?: string | null,
  data?: T,
  ctx?: Context
) {
  const res = {
    code,
    success: code === RESP_CODES.OK,
    message: message || RESPONSE_MESSAGES[code],
    data,
  };
  if (ctx) {
    ctx.body = res;
    return ctx;
  }
  return res;
}
