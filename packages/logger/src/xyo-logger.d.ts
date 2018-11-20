/**
 * A central logger for the Xyo core
 *
 * @export
 * @class XyoLogger
 */
export declare class XyoLogger {
    private readonly logger;
    constructor(dailyRotateInfoLogs: boolean, dailyRotateErrorLogs: boolean);
    /** Log to `info` level */
    info(message: string, meta?: any[]): void;
    /** Log to `error` level */
    error(message: string, meta?: any[]): void;
    /** Log to `warn` level */
    warn(message: string, meta?: any[]): void;
    private metaReducer;
}
//# sourceMappingURL=xyo-logger.d.ts.map