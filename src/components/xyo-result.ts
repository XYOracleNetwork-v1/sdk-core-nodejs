/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 28th August 2018 9:10:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-result.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:05:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError } from './xyo-error';

export class XyoResult <T> {

  public static withResult<R>(result: R): XyoResult<R> {
    return new XyoResult<R>(result);
  }

  public static withError<R>(error: XyoError): XyoResult<R> {
    return new XyoResult<R>(undefined, error);
  }

  private constructor(
    private readonly data: T | undefined,
    public readonly error?: XyoError | undefined
  ) {
    if (data && error) {
      throw new XyoError(
        `Invalid state: result and error may not both be defined`,
        XyoError.errorType.ERR_INVALID_PARAMETERS
      );
    }
  }

  get value () {
    if (this.error) {
      throw new XyoError(
        `XyoResult value was accessed before checking if there was an error.
        Original Error message: ${this.error.message}`,
        XyoError.errorType.ERR_INVALID_RESULT_ACCESS
      );
    }

    return this.data;
  }

  public hasError(): boolean {
    return this.error !== undefined;
  }
}
