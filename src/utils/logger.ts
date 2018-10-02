import winston from 'winston';

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

  public info(message: string, ...meta: any[]) {
    this.logger.info(message, meta);
  }

  public error(message: string, ...meta: any[]) {
    this.logger.error(message, meta);
  }

  public warn(message: string, ...meta: any[]) {
    this.logger.error(message, meta);
  }
}
