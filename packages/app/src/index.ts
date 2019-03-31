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
import { XyoAppLauncher } from './applauncher'
import commander from 'commander'
import dotenvExpand from 'dotenv-expand'

const getVersion = (): string => {
  dotenvExpand({
    parsed: {
      APP_VERSION:'$npm_package_version',
      APP_NAME:'$npm_package_name'
    }
  })

  return process.env.APP_VERSION || 'Unknown'
}

export async function main() {
  const program = commander

  program
    .version(getVersion())
    .option("-c, --config [config]", "specify config file")
    .option("-f, --forever [forever]", "run forever")
    .option("-p, --preflight [preflight]", "generates preflight report")
    .option("-d, --database [database]", "type of database to use", /^(mysql|level|neo4j)$/i)
    .arguments("[cmd] [target]")
    .action(async (cmd, target) => {
      const appLauncher = new XyoAppLauncher()
      try {
        if (program.forever) {
          appLauncher.setForeverPass(program.forever)
        }
        await appLauncher.initialize({ configName: target || program.config, database: program.database })
      } catch (err) {
        console.error(`There was an error during initialization. Will exit`, err)
        process.exit(1)
        return
      }

      if (!appLauncher.startNode) {
        console.log(`Exiting process after configuration`)
        process.exit(0)
        return
      }

      try {
        await appLauncher.start()
      } catch (err) {
        console.error(`There was an error during start. Will exit`, err)
        process.exit(1)
        return
      }
    })
    .parse(process.argv)
}

if (require.main === module) {
  main()
}
