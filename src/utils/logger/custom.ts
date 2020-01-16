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

interface Opts {
  prettier?: boolean
}
export const normalizeMessage = format((info, opts: Opts = {}) => {
  const message = info.message
  const { prettier } = opts
  const sep = prettier ? '\n' : '; '
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
      .join(sep)
    info.message = info.message + sep + msgs
  }
  if (prettier) {
    info.message = info.message
      .replace(/(\\)(")/g, '$2')
      .replace(/(")(\{)/, '$2')
      .replace(/(\})(")/, '$1')
  }
  return info
})
