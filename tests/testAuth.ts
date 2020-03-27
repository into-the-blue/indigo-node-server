// import path from 'path'
// require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
// import { Jwt, Crypto } from '../src/utils'

// const generateTokens = (userId: string) => {
//   const token = Crypto.encrypt({ userId })
//   return {
//     accessToken: Jwt.sign(
//       {
//         token,
//       },
//       '0s'
//     ),
//     refreshToken: Jwt.sign(
//       {
//         token,
//       },
//       '14d'
//     ),
//   }
// }

// let { accessToken: EXPIRED_TOKEN, refreshToken: VALID_TOKEN } = generateTokens(
//   '5e64c11a7a189568b8525d27'
// )

// import Axios, { AxiosInstance } from 'axios'

// let accessToken1 = EXPIRED_TOKEN

// const getNewToken = async () => {
//   const { data } = await apiClient.post('/auth/refresh', {
//     refreshToken: VALID_TOKEN,
//   })
//   return data
// }

// const errorHanlder = (instance: AxiosInstance) => async (err: any) => {
//   console.log(err.message)
//   const config = err.config

//   if (err.response.status === 401) {
//     // not authorized
//     const { success, message, accessToken, refreshToken } = await getNewToken()
//     if (!success) {
//       return Promise.reject(new Error(message))
//     }
//     console.warn(accessToken)
//     accessToken1 = accessToken
//     return instance(config)
//   }
//   return Promise.reject(err)
// }
// // Axios.interceptors.response.use(undefined, errorHanlder);

// const headers = {
//   'timvel-project': 'indigo',
//   'timvel-app': 'indigo-mp',
//   'timvel-platform': 'miniprogram',
// }
// const apiClient = Axios.create({
//   baseURL: 'http://localhost:7000/api/v1',
//   headers,
// })
// ;[apiClient].forEach(instance => {
//   instance.interceptors.request.use(value => {
//     if (accessToken1) {
//       console.warn('before')
//       value.headers['Authorization'] = 'Bearer ' + accessToken1
//     }
//     return value
//   })
//   instance.interceptors.response.use(undefined, errorHanlder(instance))
// })

// apiClient
//   .get('/users')
//   .then(({ data }) => console.log(data))
//   .catch(err => {
//     console.log('errr', err.message)
//   })
