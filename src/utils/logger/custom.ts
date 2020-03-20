import { format } from 'winston'
import util from 'util'

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
  // const sep = prettier ? '\n' : '; '
  // info.message = cvt2Str(info.message)
  // @ts-ignore
  // const args = info[Symbol.for('splat')]
  // if (Array.isArray(args)) {
  // const msgs = args.map(cvt2Str).join(sep)
  // info.message += sep + msgs
  // }
  // if (prettier) {
  //   info.message = info.message
  //     .replace(/(\\)(")/g, '$2')
  //     .replace(/(")(\{)/, '$2')
  //     .replace(/(\})(")/, '$1')
  // }
  // if (addtionalMessage) {
  //   info.message += sep + cvt2Str(addtionalMessage) + sep
  // }

  const args = info[Symbol.for('splat')]
  if (args) {
    info.message = util.format(addtionalMessage, info.message, ...args)
  }
  return info
})
