import Koa, { Context } from 'koa'
import { Subject, of } from 'rxjs'
import { tap, catchError, mergeMap, mapTo, single } from 'rxjs/operators'
import { handleRoute, Route } from './router'

export type Props = {
  routes: Route<any, any>[]
  preTap: (ctx: Context) => void
  postTap: (ctx: Context) => void
  catchTap: (error: any) => void
}
export const applyRxRouter = ({ routes, preTap, postTap, catchTap }: Props) => {
  const handleError = (error: any) => of(catchTap(error))

  return async (ctx: Context, next: () => Promise<any>) => {
    // We'll emit the Koa ctx into this Observable:
    const root$ = new Subject<Context>()

    // This Observable will indicate that the pipeline has completed:
    const done$ = new Subject<void>()

    const subscription = root$
      // Create a reactive pipeline to handle hooks and the main routing middleware:
      .pipe(
        tap(preTap),
        // Wait for the route handler to emit its result, then re-emit the ctx for use by subsequent hooks:
        mergeMap(ctx => handleRoute(ctx, routes)),
        single(),
        tap(postTap),
        catchError(handleError),
        // When the pipeline is complete, complete the done$ Observable
        tap(() => done$.complete())
      )
      .subscribe()

    // Send the request into the reactive pipeline; immediately complete the root$ Observable, as we only intend to
    // handle one request per pipeline:
    root$.next(ctx)
    root$.complete()

    // Wait for the reactive pipeline to complete:
    await done$.toPromise()

    // Clean up and then call Koa's next() callback to proceed with its middleware pipeline:
    subscription.unsubscribe()
    next()
  }
}
