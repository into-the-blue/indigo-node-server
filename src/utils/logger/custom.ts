import { format } from 'winston'
// export class ResolveObject extends Transport {
//   constructor(opts: TransportStreamOptions) {
//     super(opts)
//   }
//   log(info, callback) {
//     console.warn('Resolve Object', info)
//     setImmediate(() => {
//       this.emit('logged', info)
//     })

//     // Perform the writing to the remote service
//     callback()
//   }
// }

export const normalizeMessage = format((info, opts) => {
  const message = info.message
  if (typeof message === 'undefined') {
    info.message = 'undefined'
  } else {
    info.message = JSON.stringify(message)
  }
  // @ts-ignore
  const args = info[Symbol.for('splat')]
  if (Array.isArray(args)) {
    const msgs = args
      .map(msg => {
        if (typeof msg === 'undefined') {
          return 'undefined'
        }
        return JSON.stringify(msg)
      })
      .join('; ')
    info.message = info.message + '; ' + msgs
  }
  return info
})
