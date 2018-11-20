import { XyoLogger } from "@xyo-network/logger";
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
export declare abstract class XyoBase {
    /** Exposes a logger instance that can be used to log to central output stream */
    static logger: XyoLogger;
    static stringify(value: any): string;
    /** Logs to the `info` level */
    protected logInfo(message?: any, ...optionalParams: any[]): void;
    /** Logs to the `error` level */
    protected logError(message?: any, ...optionalParams: any[]): void;
    /** Logs to the `warn` level */
    protected logWarn(message?: any, ...optionalParams: any[]): void;
}
//# sourceMappingURL=xyo-base.d.ts.map