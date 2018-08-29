/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 28th August 2018 9:10:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-result.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:31:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError } from './xyo-error';

export class XyoResult <T> {

  public static withValue<V>(value: V): XyoResult<V> {
    return new XyoResult<V>(value);
  }

  public static withError<R>(error: XyoError): XyoResult<R> {
    return new XyoResult<R>(undefined, error);
  }

  private readonly mValue: T | undefined;
  private constructor(
    value: T | undefined,
    public readonly error?: XyoError | undefined
  ) {
    if (value && error) {
      throw new XyoError(
        `Invalid state: result and error may not both be defined`,
        XyoError.errorType.ERR_INVALID_PARAMETERS
      );
    }

    this.mValue = value;
  }

  get value () {
    if (this.error) {
      throw new XyoError(
        `XyoResult value was accessed before checking if there was an error.
        Original Error message: ${this.error.message}`,
        XyoError.errorType.ERR_INVALID_RESULT_ACCESS
      );
    }

    return this.mValue;
  }

  public hasError(): boolean {
    return this.error !== undefined;
  }
}
