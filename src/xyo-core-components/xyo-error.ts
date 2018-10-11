/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 28th August 2018 9:12:38 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-error.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 1:15:25 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from './xyo-base';

/**
 * A list of supported error types
 */

export enum XyoErrors {
  CRITICAL = 1,
  INVALID_PARAMETERS = 2,
  CREATOR_MAPPING = 3,
  INVALID_RESULT_ACCESS = 4
}

/**
 * An XyoError wraps the native Error interface.
 * Errors in Xyo sdk should only throw these types
 * of errors
 */
export class XyoError extends XyoBase implements Error {

  public readonly isXyoError: boolean = true;
  public readonly stack: string | undefined;
  public readonly name: string = 'XyoError';

  /**
   * Creates a new instance of an XyoError
   *
   * @param message A message for the error
   * @param code The type of XyoErrorType
   * @param fromOtherError Initial error, if it exists
   */

  constructor(
    public readonly message: string,
    public readonly code: XyoErrors,
    fromOtherError?: Error
  ) {
    super();
    this.stack = (fromOtherError && fromOtherError.stack) || new Error().stack;
    let errorMsg = `An Xyo error was thrown with message ${message}`;
    if (this.stack) {
      errorMsg = `${errorMsg} and stack\n\n${this.stack}`;
    }

    this.logError(errorMsg);
  }
}
