/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st September 2018 10:33:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 24th September 2018 6:43:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

type XyoLogger = Console;

export abstract class XyoBase {
  public logger!: XyoLogger;

  protected logInfo(message?: any, ...optionalParams: any[]) {
    const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined;
    if (resolvedOptionalParams) {
      this.logger.info(`${this.constructor.name}: ${message}`, resolvedOptionalParams);
    } else {
      this.logger.info(`${this.constructor.name}: ${message}`);
    }
  }

  protected logError(message?: any, ...optionalParams: any[]) {
    const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined;
    if (resolvedOptionalParams) {
      this.logger.error(`${this.constructor.name}: ${message}`, resolvedOptionalParams);
    } else {
      this.logger.error(`${this.constructor.name}: ${message}`);
    }
  }

  protected logWarn(message?: any, ...optionalParams: any[]) {
    const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined;
    if (resolvedOptionalParams) {
      this.logger.warn(`${this.constructor.name}: ${message}`, resolvedOptionalParams);
    } else {
      this.logger.warn(`${this.constructor.name}: ${message}`);
    }
  }
}

XyoBase.prototype.logger = console;