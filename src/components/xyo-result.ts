/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 28th August 2018 9:10:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-result.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th September 2018 10:24:49 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError } from './xyo-error';
const logger = console;

export class XyoResult <T> {

  public static defaultStrictValue = true;

  public static withValue<V>(value: V, isStrict?: boolean | undefined): XyoResult<V> {
    return new XyoResult<V>(
      value,
      undefined,
      typeof isStrict === 'boolean' ? isStrict : XyoResult.defaultStrictValue
    );
  }

  public static withError<R>(error: XyoError, isStrict?: boolean | undefined): XyoResult<R> {
    logger.error(`
      Error: ${error.name}
      Message: ${error.message}
      Code: ${error.code}
      isXyoError: ${error.isXyoError}

      Stack: ${error.stack}

    `);

    return new XyoResult<R>(
      undefined,
      error,
      typeof isStrict === 'boolean' ? isStrict : XyoResult.defaultStrictValue
    );
  }

  private readonly mValue: T | undefined;
  private readonly mError: XyoError | undefined;
  private hasCheckedError: boolean = false;

  private constructor(
    value: T | undefined,
    error: XyoError | undefined,
    public readonly isStrict: boolean
  ) {
    if (value && error) {
      throw new XyoError(
        `Invalid state: result and error may not both be defined`,
        XyoError.errorType.ERR_INVALID_PARAMETERS
      );
    }

    this.mValue = value;
    this.mError = error;
  }

  get value () {
    if (!this.hasCheckedError && this.isStrict) {
      logger.warn(`Checking XyoResult.value before checking error ${new Error().stack}`);
    }

    if (this.mError) {
      throw new XyoError(
        `XyoResult value was accessed before checking if there was an error.
        Original Error message: ${this.mError.message}`,
        XyoError.errorType.ERR_INVALID_RESULT_ACCESS
      );
    }

    return this.mValue;
  }

  get error () {
    if (!this.hasCheckedError && this.isStrict) {
      logger.warn(`Checking XyoResult.error before checking error ${new Error().stack}`);
    }

    if (!this.mError) {
      throw new XyoError(
        `XyoResult error was accessed before checking if there was an error.`,
        XyoError.errorType.ERR_INVALID_RESULT_ACCESS
      );
    }

    return this.mError;
  }

  public hasError(): boolean {
    this.hasCheckedError = true;
    return this.mError !== undefined;
  }
}
