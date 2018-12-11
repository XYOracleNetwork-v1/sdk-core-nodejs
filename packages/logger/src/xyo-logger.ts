/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 11:27:43 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-logger.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:50:59 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import winston from 'winston'
import DailyRotateFile from "winston-daily-rotate-file"

/**
 * A central logger for the Xyo core
 *
 * @export
 * @class XyoLogger
 */

export class XyoLogger {
  private readonly logger: winston.Logger

  constructor (dailyRotateInfoLogs: boolean, dailyRotateErrorLogs: boolean) {
    this.logger = (() => {
      const transports = []

      if (dailyRotateInfoLogs) {
        transports.push(new DailyRotateFile({
          dirname: 'logs/info',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info'
        }))
      }

      if (dailyRotateErrorLogs) {
        transports.push(new DailyRotateFile({
          dirname: 'logs/error',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error'
        }))
      }

      transports.push(new winston.transports.Console())

      return winston.createLogger({
        transports,
        format: winston.format.combine(
          winston.format.colorize(),
          xyoLogFormat(),
          winston.format.simple(),
        ),
      })
    })()
  }

  /** Log to `info` level */
  public info(message: string, meta?: any[]) {
    this.logger.info(this.metaReducer(message, meta))
  }

  /** Log to `error` level */
  public error(message: string, meta?: any[]) {
    this.logger.error(this.metaReducer(message, meta))
  }

  /** Log to `warn` level */
  public warn(message: string, meta?: any[]) {
    this.logger.warn(this.metaReducer(message, meta))
  }

  private metaReducer(message: string, meta?: any[]) {
    if (meta && meta.length) {
      const metaMsg = meta.reduce((memo, item) => {
        return ([] as any[]).concat(memo, [
          item instanceof Error ?
            `${item.stack || item.message}` :
            item.toString()
        ])
      }, []).join('\n')

      return `${message}\n${metaMsg}`
    }

    return message
  }

}

const xyoLogFormat = winston.format((info, opts) => {
  info.message = `${new Date().toISOString()} ${info.message}`
  return info
})
