import { default as winston, Logger as WinstonLogger, TransportInstance } from 'winston';

export class XyoLogger extends WinstonLogger {

  constructor() {
    const transports: TransportInstance[] = [
      new winston.transports.Console({ level: 'debug' })
    ];

    super({ transports });
  }
}
