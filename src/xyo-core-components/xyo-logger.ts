import winston from 'winston';

/**
 * A central logger for the Xyo core
 *
 * @export
 * @class XyoLogger
 */
export class XyoLogger {
  private readonly logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });

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
