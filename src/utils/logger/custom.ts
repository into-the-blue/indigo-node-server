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
  addtionalMessage?: object | string
}

const cvt2Str = (input: any) => {
  if (typeof input === 'string') return input
  if (typeof input === 'undefined') return 'undefined'
  return JSON.stringify(input)
}
export const normalizeMessage = format((info, opts: Opts = {}) => {
  // const message = info.message
  const { prettier, addtionalMessage } = opts
  const sep = prettier ? '\n' : '; '
  info.message = cvt2Str(info.message)
  // @ts-ignore
  const args = info[Symbol.for('splat')]
  if (Array.isArray(args)) {
    const msgs = args.map(cvt2Str).join(sep)
    info.message += sep + msgs
  }
  if (prettier) {
    info.message = info.message
      .replace(/(\\)(")/g, '$2')
      .replace(/(")(\{)/, '$2')
      .replace(/(\})(")/, '$1')
  }
  if (addtionalMessage) {
    info.message += sep + cvt2Str(addtionalMessage) + sep
  }
  return info
})
