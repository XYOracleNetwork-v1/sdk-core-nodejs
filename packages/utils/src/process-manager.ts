/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Thursday, 13th December 2018 1:17:30 pm
* @Email:  developer@xyfindables.com
* @Filename: process-manager.ts
* @Last modified by: ryanxyo
* @Last modified time: Friday, 15th February 2019 10:35:41 am
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

// tslint:disable:no-console

import { LifeCycleRunner } from "."
import { XyoBase } from "@xyo-network/base"

export class ProcessManager {

  public unhandledRejections = new Map()

  constructor (private readonly program: LifeCycleRunner) {}

  public async manage(process: NodeJS.Process) {
    process.on('beforeExit', (exitCode) => {
      XyoBase.unschedule()
      console.log(`Will exit with exitCode ${exitCode}`)
    })
    .on('exit', async (exitCode) => {
      XyoBase.unschedule()
      if (this.program.canStop()) {
        await this.program.stop()
      }

      console.log(`Exiting with exitCode ${exitCode}`)
    })
    .on('multipleResolves', (type, promise, value) => {
      console.error(`A promise with type ${type} was resolved multiple times with value ${value}. Will exit.`)
      setImmediate(() => process.exit(1))
    })
    .on('unhandledRejection', async (reason, promise) => {
      console.error(`There was an unhandled rejection ${reason} ${promise}`)
      this.unhandledRejections.set(promise, reason)
      if (this.program.canStop()) {
        await this.program.stop()
      }
    })
    .on('rejectionHandled', (promise) => {
      console.error(`Reject handled ${promise}`)
      this.unhandledRejections.delete(promise)
    })
    .on('uncaughtException', async (err) => {
      console.error(`Uncaught exception. Will exit.\n\n${err.message}\n\n${err.stack}`)
      if (this.program.canStop()) {
        await this.program.stop()
      }

      setImmediate(() => process.exit(1))
    })
    .on('warning', (warning) => {
      console.warn(warning.name)    // Print the warning name
      console.warn(warning.message) // Print the warning message
      if (warning.stack) {
        console.warn(warning.stack)   // Print the stack trace
      }
    })
    .on('SIGINT', async () => {
      if (this.program && this.program.canStop()) {
        console.log(`Shutting down`)
        console.log(`Shutdown. Will Exit.`)
        await this.program.stop()
      }

      process.exit(0)
    })

    try {
      await this.program.initialize()
      await this.program.start()
    } catch (e) {
      console.error(`Uncaught error in process-manager`, e)
      throw e
    }
  }
}
