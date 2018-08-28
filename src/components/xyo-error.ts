/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 28th August 2018 9:12:38 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-error.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 9:49:03 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
export class XyoError implements Error {

  public readonly isXyoError: boolean = true;
  public readonly stack: string | undefined;
  public readonly name: string = 'XyoError';

  constructor(
    public readonly message: string,
    public readonly code: XyoErrorType,
    fromOtherError?: Error
  ) {
    this.stack = (fromOtherError && fromOtherError.stack) || new Error().stack;
  }
}

export enum XyoErrorType {
  ERR_CRITICAL = 1,
  ERR_INVALID_PARAMETERS = 2
}
