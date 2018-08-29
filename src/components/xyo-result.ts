/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 28th August 2018 9:10:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-result.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:20:31 pm
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
    public readonly result: T | undefined,
    public readonly error?: XyoError | undefined
  ) {
    if (result && error) {
      throw new XyoError(
        `Invalid state: result and error may not both be defined`,
        XyoError.errorType.ERR_INVALID_PARAMETERS
      );
    }
  }

  public hasError(): boolean {
    return this.error !== undefined;
  }
}
