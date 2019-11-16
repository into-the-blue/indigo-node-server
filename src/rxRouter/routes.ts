import { of } from 'rxjs'
import {} from 'rxjs/operators'
import { json } from './response'
import { route, match } from './router'

export const getTest = route(
  req => req.url === '/test' && match({ aa: 'aa' }),
  (params, ctx) =>
    of(json({ url: ctx.request.url, message: 'hello' + params.aa }))
)
