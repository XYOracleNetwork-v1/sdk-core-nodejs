"use strict";
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st September 2018 10:33:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 11:35:28 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@xyo-network/logger");
const fast_safe_stringify_1 = __importDefault(require("fast-safe-stringify"));
/**
 * A general purpose base class that can be used to incorporate
 * base functionality into the classes that extend it.
 *
 * This can be extended to include cross-cutting features like
 * logging that are not domain-specific.
 *
 * @export
 * @abstract
 * @class XyoBase
 */
class XyoBase {
    static stringify(value) {
        return fast_safe_stringify_1.default(value, (key, v) => {
            if (v === '[Circular]') {
                return;
            }
            return v;
        }, 2);
    }
    /** Logs to the `info` level */
    logInfo(message, ...optionalParams) {
        const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined;
        if (resolvedOptionalParams) {
            XyoBase.logger.info(`${this.constructor.name}: ${message}`, resolvedOptionalParams);
        }
        else {
            XyoBase.logger.info(`${this.constructor.name}: ${message}`);
        }
    }
    /** Logs to the `error` level */
    logError(message, ...optionalParams) {
        const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined;
        if (resolvedOptionalParams) {
            XyoBase.logger.error(`${this.constructor.name}: ${message}`, resolvedOptionalParams);
        }
        else {
            XyoBase.logger.error(`${this.constructor.name}: ${message}`);
        }
    }
    /** Logs to the `warn` level */
    logWarn(message, ...optionalParams) {
        const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined;
        if (resolvedOptionalParams) {
            XyoBase.logger.warn(`${this.constructor.name}: ${message}`, resolvedOptionalParams);
        }
        else {
            XyoBase.logger.warn(`${this.constructor.name}: ${message}`);
        }
    }
}
exports.XyoBase = XyoBase;
XyoBase.logger = new logger_1.XyoLogger(process.env.NODE_ENV !== 'test', process.env.NODE_ENV !== 'test');
//# sourceMappingURL=xyo-base.js.map