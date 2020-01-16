import { createLogger, transports, format } from 'winston'
import { normalizeMessage } from './custom'
import DailyRoateFileTransport from 'winston-daily-rotate-file'
import path from 'path'

type FTOpt = {
  filename: string
  level?: 'info' | 'error'
}

const LOG_FILE_DIR = path.join(__dirname, '..', '..', '..', 'logs')

const consoleTransport = new transports.Console({
  format: format.combine(
    normalizeMessage({ prettier: true }),
    format.colorize(),
    format.simple()
  ),
})

const genFileTransports = (...opts: FTOpt[]) => {
  return opts.map(opt => {
    return new DailyRoateFileTransport({
      dirname: LOG_FILE_DIR,
      filename: '%DATE%-' + opt.filename,
      extension: '.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      zippedArchive: true,
      level: opt.level,
      format: format.combine(normalizeMessage(), format.json()),
    })
  })
}

export const logger = createLogger({
  format: format.combine(format.label({ label: 'INDIGO' }), format.timestamp()),
  transports: [
    ...genFileTransports(
      { filename: 'combined' },
      { filename: 'info', level: 'info' },
      { filename: 'error', level: 'error' }
    ),
    consoleTransport,
  ],
  exceptionHandlers: [
    consoleTransport,
    ...genFileTransports({ filename: 'exceptions' }),
  ],
  exitOnError: false,
})
