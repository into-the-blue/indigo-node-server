import { Context, Request } from 'koa'
import { Response, notFound } from './response'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
type Match<P> = {
  params: P
}

type RouteMatchResult<P> = Match<P> | false | undefined

type RouteMatcher<P> = (request: Request) => RouteMatchResult<P>

type RouteHandler<P, T> = (params: P, ctx: Context) => Observable<Response<T>>

export type Route<P, R> = {
  matcher: RouteMatcher<P>
  handler: RouteHandler<P, R>
}

export const match = <P>(params: P): Match<P> => ({
  params,
})

export const route = <P, R>(
  matcher: RouteMatcher<P>,
  handler: RouteHandler<P, R>
): Route<P, R> => ({
  matcher,
  handler,
})

export const handleRoute = (ctx: Context, routes: Route<any, any>[]) => {
  let result$: Observable<Response<any>> | undefined

  routes.some(({ matcher, handler }) => {
    const match = matcher(ctx.request)
    if (!match) {
      return false
    }
    result$ = handler(match.params, ctx)
    return true
  })

  return (result$ || of(notFound())).pipe(map(handleResponse(ctx)))
}

const handleResponse = (ctx: Context) => (response: Response<any>): Context => {
  ctx.status = ctx.status
  ctx.type = 'json'
  ctx.body = response.body
  return ctx
}
