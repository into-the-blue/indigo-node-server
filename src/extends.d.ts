import { LogCallback, Logger } from 'winston'

// declare interface LeveledLogMethod {
//   (message: string, callback: LogCallback): Logger
//   (message: string, meta: any, callback: LogCallback): Logger
//   (message: string, ...meta: any[]): Logger
//   (message: any, ...meta: any[]): Logger
//   (infoObject: object): Logger
// }

declare module 'winston' {
  interface LeveledLogMethod {
    (message: string, callback: LogCallback): Logger
    (message: string, meta: any, callback: LogCallback): Logger
    (message: string, ...meta: any[]): Logger
    (message: any, ...meta: any[]): Logger
    (infoObject: object | any): Logger
  }
}
