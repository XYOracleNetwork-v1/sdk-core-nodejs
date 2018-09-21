/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st September 2018 10:33:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 10:47:18 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

type XyoLogger = Console;

export abstract class XyoBase {
  public logger!: XyoLogger;

  protected logInfo(message?: any, ...optionalParams: any[]) {
    this.logger.info(`${this.constructor.name}: ${message}`, optionalParams);
  }

  protected logError(message?: any, ...optionalParams: any[]) {
    this.logger.error(`${this.constructor.name}: ${message}`, optionalParams);
  }

  protected logWarn(message?: any, ...optionalParams: any[]) {
    this.logger.warn(`${this.constructor.name}: ${message}`, optionalParams);
  }
}

XyoBase.prototype.logger = console;
