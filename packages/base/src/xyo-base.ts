/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st September 2018 10:33:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:29:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoLogger } from "@xyo-network/logger"
import safeStringify from 'fast-safe-stringify'

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
export abstract class XyoBase {

  /** Exposes a logger instance that can be used to log to central output stream */
  public static logger: XyoLogger

  public static stringify(value: any): string {
    return safeStringify(value, (key, v) => {
      if (v === '[Circular]') {
        return
      }

      return v
    }, 2)
  }

  public static unschedule() {
    Object.values(this.immediateIds).forEach(v => clearImmediate(v))
    Object.values(this.timeoutIds).forEach(v => clearTimeout(v))
    Object.values(this.intervalIds).forEach(v => clearInterval(v))
  }

  public static timeout(fn: (...args: any[]) => void, timeMs: number, description?: string) {
    return this.schedule(setTimeout, clearTimeout, fn, timeMs, this.timeoutIds, description)
  }

  public static interval(fn: (...args: any[]) => void, timeMs: number, description?: string) {
    return this.schedule(setInterval, clearInterval, fn, timeMs, this.intervalIds, description)
  }

  public static immediate(fn: (...args: any[]) => void, description?: string) {
    return this.schedule(setImmediate, clearImmediate, fn, 0, this.immediateIds, description)
  }

  private static timeoutIds: {[s: string]: NodeJS.Timeout} = {}
  private static intervalIds: {[s: string]: NodeJS.Timeout} = {}
  private static immediateIds: {[s: string]: NodeJS.Immediate} = {}

  private static schedule<T>(
    scheduler: (callback: (...args: any[]) => void, ms: number, ...args: any[]) => T,
    unscheduler: (t: T) => void,
    fn: (...args: any[]) => void,
    timeMs: number,
    aggregator: {[s: string]: T},
    description?: string
  ) {
    const key = String(new Date().valueOf() + Math.random())
    const t = scheduler(() => {
      delete this.timeoutIds[key]
      if (description) XyoBase.logger.info(`Scheduler resolved: ${description} after ${timeMs}ms`)
      fn()
    }, timeMs)
    aggregator[key] = t
    return () => {
      delete aggregator[key]
      unscheduler(t)
    }
  }

  /** Logs to the `info` level */
  protected logInfo(message?: any, ...optionalParams: any[]) {
    const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined
    if (resolvedOptionalParams) {
      XyoBase.logger.info(`${this.constructor.name}: ${message}`, resolvedOptionalParams)
    } else {
      XyoBase.logger.info(`${this.constructor.name}: ${message}`)
    }
  }

  /** Logs to the `error` level */
  protected logError(message?: any, ...optionalParams: any[]) {
    const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined
    if (resolvedOptionalParams) {
      XyoBase.logger.error(`${this.constructor.name}: ${message}`, resolvedOptionalParams)
    } else {
      XyoBase.logger.error(`${this.constructor.name}: ${message}`)
    }
  }

  /** Logs to the `warn` level */
  protected logWarn(message?: any, ...optionalParams: any[]) {
    const resolvedOptionalParams = (optionalParams && optionalParams.length && optionalParams) || undefined
    if (resolvedOptionalParams) {
      XyoBase.logger.warn(`${this.constructor.name}: ${message}`, resolvedOptionalParams)
    } else {
      XyoBase.logger.warn(`${this.constructor.name}: ${message}`)
    }
  }
}

XyoBase.logger = new XyoLogger(
  process.env.ENABLE_LOGGING_FILES !== undefined,
  process.env.ENABLE_LOGGING_FILES !== undefined
)
