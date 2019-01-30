/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th December 2018 1:17:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: process-manager.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 1:23:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:no-console

export class ProcessManager {

  public unhandledRejections = new Map()

  constructor (private readonly program: { start: () => void}) {}

  public async manage(process: NodeJS.Process) {
    process.on('beforeExit', (exitCode) => {
      console.log(`Will exit with exitCode ${exitCode}`)
    })
    .on('exit', (exitCode) => {
      console.log(`Exiting with exitCode ${exitCode}`)
    })
    .on('multipleResolves', (type, promise, value) => {
      console.error(`A promise with type ${type} was resolved multiple times with value ${value}. Will exit.`)
      setImmediate(() => process.exit(1))
    })
    .on('unhandledRejection', (reason, promise) => {
      console.error(`There was an unhandled rejection ${reason} ${promise}`)
      this.unhandledRejections.set(promise, reason)
    })
    .on('rejectionHandled', (promise) => {
      console.error(`Reject handled ${promise}`)
      this.unhandledRejections.delete(promise)
    })
    .on('uncaughtException', (err) => {
      console.error(`Uncaught exception. Will exit.\n\n${err.message}\n\n${err.stack}`)
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
      if (this.program) {
        console.log(`Shutting down archivist`)
        console.log(`Archivist shutdown. Will Exit.`)
      }

      process.exit(0)
    })

    this.program.start()
  }
}
