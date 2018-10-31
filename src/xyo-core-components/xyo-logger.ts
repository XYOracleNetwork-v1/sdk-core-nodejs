import winston from 'winston';

import DailyRotateFile from "winston-daily-rotate-file";

/**
 * A central logger for the Xyo core
 *
 * @export
 * @class XyoLogger
 */
export class XyoLogger {
  private readonly logger = (() => {
    const transport = new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    });

    return winston.createLogger({
      transports: [
        transport,
        new winston.transports.Console()
      ]
    });
  })();

  /** Log to `info` level */
  public info(message: string, ...meta: any[]) {
    this.logger.info(message, meta);
  }

  /** Log to `error` level */
  public error(message: string, ...meta: any[]) {
    this.logger.error(message, meta);
  }

  /** Log to `warn` level */
  public warn(message: string, ...meta: any[]) {
    this.logger.error(message, meta);
  }
}
