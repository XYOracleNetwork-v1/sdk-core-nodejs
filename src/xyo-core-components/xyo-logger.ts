import winston from 'winston';

import DailyRotateFile from "winston-daily-rotate-file";

// @ts-ignore
import { MESSAGE } from 'triple-beam';

/**
 * A central logger for the Xyo core
 *
 * @export
 * @class XyoLogger
 */

export class XyoLogger {
  private readonly logger = (() => {
    const infoTransport = new DailyRotateFile({
      filename: 'logs/info/%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    });

    const errorTransport = new DailyRotateFile({
      filename: 'logs/error/%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    });

    return winston.createLogger({
      format: winston.format.combine(
        winston.format.colorize(),
        xyoLogFormat(),
        winston.format.simple(),
      ),
      transports: [
        infoTransport,
        errorTransport,
        new winston.transports.Console()
      ]
    });
  })();

  /** Log to `info` level */
  public info(message: string, ...meta: any[]) {
    if (meta.length) {
      this.logger.info(message, meta);
    } else {
      this.logger.info(message);
    }
  }

  /** Log to `error` level */
  public error(message: string, ...meta: any[]) {
    if (meta.length) {
      this.logger.error(message, meta);
    } else {
      this.logger.error(message);
    }
  }

  /** Log to `warn` level */
  public warn(message: string, ...meta: any[]) {
    if (meta.length) {
      this.logger.warn(message, meta);
    } else {
      this.logger.warn(message);
    }
  }
}

const xyoLogFormat = winston.format((info, opts) => {
  info.message = `${new Date().toISOString()} ${info.message}`;
  return info;
});
