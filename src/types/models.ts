import { VerifyErrors } from 'jsonwebtoken'
export interface IJwtResponse {
  success: boolean
  err?: VerifyErrors
  result?: string | object
}
