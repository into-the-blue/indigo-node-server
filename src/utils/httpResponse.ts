export enum RESP_CODES {
  OK = 1,
  VALUE_MISSING = 101,
  INVALID_INPUTS = 102,
  ACCESS_TOKEN_EXPIRED = 201,
}
const RESPONSE_MESSAGES = {
  [RESP_CODES.OK]: 'ok',
  [RESP_CODES.VALUE_MISSING]: 'missing inputs',
  [RESP_CODES.INVALID_INPUTS]: 'invalid inputs',
  [RESP_CODES.ACCESS_TOKEN_EXPIRED]: 'access token expired',
}

export const response = <T>(
  code: RESP_CODES,
  message?: string | null,
  data?: T
) => {
  return {
    code,
    success: code === RESP_CODES.OK,
    message: message || RESPONSE_MESSAGES[code],
    data,
  }
}
