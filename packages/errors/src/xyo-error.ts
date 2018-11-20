/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 3:23:49 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-error.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 3:24:29 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base';

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
    this.logError(`An XyoError was thrown`, this);
  }

  public toString(): string {
    return `XyoError: ${this.message}.${this.stack ? `\n${this.stack}` : ''}`;
  }
}
