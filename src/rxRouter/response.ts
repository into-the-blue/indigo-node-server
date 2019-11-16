enum Responses {
  Json,
  Error,
}
type ResponseWith<T extends Responses, B> = {
  type: T
  status: number
  body: B
}

type JsonResponse<B> = ResponseWith<Responses.Json, B>

type ErrorResponse = ResponseWith<Responses.Error, { message: string }>

export type Response<T> = JsonResponse<T> | ErrorResponse

export const json = <T>(body: T): JsonResponse<T> => ({
  type: Responses.Json,
  status: 200,
  body,
})

export const notFound = (message = 'Not Found'): ErrorResponse => ({
  type: Responses.Error,
  status: 404,
  body: { message },
})

export const tooFrequently = (message: 'Too Frequently'): ErrorResponse => ({
  type: Responses.Error,
  status: 429,
  body: { message },
})
