import { XyoBase } from '@xyo-network/base';
/**
 * A list of supported error types
 */
export declare enum XyoErrors {
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
export declare class XyoError extends XyoBase implements Error {
    readonly message: string;
    readonly code: XyoErrors;
    readonly isXyoError: boolean;
    readonly stack: string | undefined;
    readonly name: string;
    /**
     * Creates a new instance of an XyoError
     *
     * @param message A message for the error
     * @param code The type of XyoErrorType
     * @param fromOtherError Initial error, if it exists
     */
    constructor(message: string, code: XyoErrors, fromOtherError?: Error);
    toString(): string;
}
//# sourceMappingURL=xyo-error.d.ts.map