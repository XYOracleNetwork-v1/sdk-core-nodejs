/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 10:15:15 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 3:55:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export { IAppConfig } from './@types'
import * as path from 'path'
import { XyoAppLauncher } from './applauncher'

export async function main(args: string[]) {
  const appLauncher = new XyoAppLauncher()
  try {
    if (path.basename(args[1]) === 'start-forever.js') {
      if (args.length < 4) {
        console.error(`Must run 'forever' with params 'yarn forever [config]'`)
        process.exit(1)
        return
      }
      appLauncher.setForeverPass(args[args.length - 1])
    }
    await appLauncher.initialize(args[2])
  } catch (err) {
    console.error(`There was an error during initialization. Will exit`, err)
    process.exit(1)
    return
  }

  if (!appLauncher.startNode) {
    console.log(`Exiting process after configuration`)
    process.exit(0)
  }

  try {
    await appLauncher.start()
  } catch (err) {
    console.error(`There was an error during start. Will exit`, err)
    process.exit(1)
    return
  }
}
