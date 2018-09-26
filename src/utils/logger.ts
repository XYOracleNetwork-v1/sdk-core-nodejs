import { default as winston, Logger as WinstonLogger, TransportInstance } from 'winston';

class Logger extends WinstonLogger {

  constructor() {
    const transports: TransportInstance[] = [
      new winston.transports.Console({ level: 'debug' })
    ];

    super({ transports });
  }
}

export default Logger;
