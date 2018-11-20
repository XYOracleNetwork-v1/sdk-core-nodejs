"use strict";
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 11:27:43 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-logger.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 5:41:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
/**
 * A central logger for the Xyo core
 *
 * @export
 * @class XyoLogger
 */
class XyoLogger {
    constructor(dailyRotateInfoLogs, dailyRotateErrorLogs) {
        this.logger = (() => {
            const transports = [];
            if (dailyRotateInfoLogs) {
                transports.push(new winston_daily_rotate_file_1.default({
                    dirname: 'logs/info',
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'info'
                }));
            }
            if (dailyRotateErrorLogs) {
                transports.push(new winston_daily_rotate_file_1.default({
                    dirname: 'logs/error',
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'error'
                }));
            }
            transports.push(new winston_1.default.transports.Console());
            return winston_1.default.createLogger({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), xyoLogFormat(), winston_1.default.format.simple()),
                transports
            });
        })();
    }
    /** Log to `info` level */
    info(message, meta) {
        this.logger.info(this.metaReducer(message, meta));
    }
    /** Log to `error` level */
    error(message, meta) {
        this.logger.error(this.metaReducer(message, meta));
    }
    /** Log to `warn` level */
    warn(message, meta) {
        this.logger.warn(this.metaReducer(message, meta));
    }
    metaReducer(message, meta) {
        if (meta && meta.length) {
            const metaMsg = meta.reduce((memo, item) => {
                return [].concat(memo, [
                    item instanceof Error ?
                        `${item.stack || item.message}` :
                        item.toString()
                ]);
            }, []).join('\n');
            return `${message}\n${metaMsg}`;
        }
        return message;
    }
}
exports.XyoLogger = XyoLogger;
const xyoLogFormat = winston_1.default.format((info, opts) => {
    info.message = `${new Date().toISOString()} ${info.message}`;
    return info;
});
//# sourceMappingURL=xyo-logger.js.map