import { Logger as WinstonLogger, TransportInstance } from 'winston';
// tslint:disable-next-line:no-duplicate-imports
import winston from 'winston';
export class XyoLogger extends WinstonLogger {

  constructor() {
    const transports: TransportInstance[] = [
      new winston.transports.Console({ level: 'debug' })
    ];

    super({ transports });
  }
}
