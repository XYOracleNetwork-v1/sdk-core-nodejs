/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 28th August 2018 9:12:38 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-error.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 4:50:31 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * A list of supported error types
 */

enum XyoErrorType {
  ERR_CRITICAL = 1,
  ERR_INVALID_PARAMETERS = 2,
  ERR_CREATOR_MAPPING = 3
}

/**
 * An XyoError wraps the native Error interface.
 * Errors in Xyo sdk should only throw these types
 * of errors
 */
export class XyoError implements Error {

  public static readonly errorType = XyoErrorType;

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
    public readonly code: XyoErrorType,
    fromOtherError?: Error
  ) {
    this.stack = (fromOtherError && fromOtherError.stack) || new Error().stack;
  }
}
