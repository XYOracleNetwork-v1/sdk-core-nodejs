"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@xyo-network/base");
/**
 * A list of supported error types
 */
var XyoErrors;
(function (XyoErrors) {
    XyoErrors[XyoErrors["CRITICAL"] = 1] = "CRITICAL";
    XyoErrors[XyoErrors["INVALID_PARAMETERS"] = 2] = "INVALID_PARAMETERS";
    XyoErrors[XyoErrors["CREATOR_MAPPING"] = 3] = "CREATOR_MAPPING";
    XyoErrors[XyoErrors["INVALID_RESULT_ACCESS"] = 4] = "INVALID_RESULT_ACCESS";
})(XyoErrors = exports.XyoErrors || (exports.XyoErrors = {}));
/**
 * An XyoError wraps the native Error interface.
 * Errors in Xyo sdk should only throw these types
 * of errors
 */
class XyoError extends base_1.XyoBase {
    /**
     * Creates a new instance of an XyoError
     *
     * @param message A message for the error
     * @param code The type of XyoErrorType
     * @param fromOtherError Initial error, if it exists
     */
    constructor(message, code, fromOtherError) {
        super();
        this.message = message;
        this.code = code;
        this.isXyoError = true;
        this.name = 'XyoError';
        this.stack = (fromOtherError && fromOtherError.stack) || new Error().stack;
        this.logError(`An XyoError was thrown`, this);
    }
    toString() {
        return `XyoError: ${this.message}.${this.stack ? `\n${this.stack}` : ''}`;
    }
}
exports.XyoError = XyoError;
//# sourceMappingURL=xyo-error.js.map