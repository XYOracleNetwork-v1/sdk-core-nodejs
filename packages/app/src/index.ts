/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 10:15:15 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 19th February 2019 3:41:35 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNode } from '@xyo-network/base-node'
import { ProcessManager, fileExists, readFile, writeFile, createDirectoryIfNotExists } from '@xyo-network/utils'
import { XyoBase } from '@xyo-network/base'
import path from 'path'
import { AppWizard } from './app-wizard'
import { IAppConfig } from './@types'
import yaml, { safeDump } from 'js-yaml'
import { validateConfigFile } from './validator'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { CatalogueItem } from '@xyo-network/network'
import { IXyoComponentFeatureResponse } from '@xyo-network/node-network'

export class XyoAppLauncher extends XyoBase {

  public config: IAppConfig | undefined
  public yamlConfig: string | undefined
  public startNode = true

  public async initialize(configName?: string) {
    let writeConfigFile = false

    const rootPath = path.resolve(__dirname, '..')
    const configFolder = path.resolve(rootPath, 'config')

    if (configName) {
      this.logInfo(`Configuration name: ${configName}`)
      const configPath = path.resolve(configFolder, `${configName}.yaml`)

      const exists = await fileExists(configPath)
      if (exists) {
        this.logInfo(`Found config file at ${configPath}`)
        const file = await readFile(configPath, 'utf8')
        this.yamlConfig = file
        this.config = yaml.safeLoad(file) as IAppConfig
      } else {
        this.logInfo(`Could not find a configuration file at ${configPath}`)
        const res = await new AppWizard(rootPath).createConfiguration(configName)
        this.config = (res && res.config) || undefined
        this.startNode = Boolean(res && res.startNode)
        writeConfigFile = true
      }
    } else {
      this.logInfo(`No configuration passed in not found`)
      const res = await new AppWizard(rootPath).createConfiguration()
      this.config = (res && res.config) || undefined
      this.startNode = Boolean(res && res.startNode)
      writeConfigFile = true
    }

    if (!this.config) {
      this.logInfo(`Config not set`)
      return
    }

    const { validates, message } = await validateConfigFile(this.config)
    if (!validates) {
      throw new XyoError(`There was an error in your config file ${message}. Exiting`, XyoErrors.CRITICAL)
    }

    if (writeConfigFile) {
      this.yamlConfig = safeDump(this.config)
      await this.writeConfigFile(this.yamlConfig, this.config, configFolder)
    }

    this.logInfo(`Config:\n\n${this.yamlConfig}\n\n`)
  }

  public start () {
    if (!this.config) throw new XyoError(`Config not initialized`, XyoErrors.CRITICAL)

    const nodeData = path.resolve(this.config.data, this.config.name)
    const isArchivist = Boolean(this.config.archivist)
    const isDiviner = Boolean(this.config.diviner)

    if (!isArchivist && !isDiviner) {
      throw new XyoError(`Must support at least archivist or diviner functionality`, XyoErrors.CRITICAL)
    }

    const features: IXyoComponentFeatureResponse = {}

    if (isArchivist && this.config.graphqlPort && this.config.serverPort) {
      features.archivist = {
        featureType: 'archivist',
        supportsFeature: true,
        featureOptions: {
          graphqlHost: this.config.ip,
          graphqlPort: this.config.graphqlPort,
          boundWitnessHost: this.config.ip,
          boundWitnessPort: this.config.serverPort
        }
      }
    }

    if (isDiviner) {
      features.diviner = {
        featureType: 'diviner',
        supportsFeature: true,
        featureOptions: {}
      }
    }

    const newNode = new XyoNode({
      config: {
        nodeRunnerDelegates: {
          enableBoundWitnessServer: Boolean(this.config.serverPort),
          enableGraphQLServer: Boolean(this.config.graphqlPort && this.config.apis.length > 0),
          enableQuestionsWorker: isDiviner
        },
        data: {
          path: nodeData
        },
        discovery: {
          bootstrapNodes: this.config.bootstrapNodes,
          publicKey: this.config.name,
          address: `/ip4/${this.config.ip}/tcp/${this.config.p2pPort}`
        },
        peerTransport: {
          address: `/ip4/${this.config.ip}/tcp/${this.config.p2pPort}`
        },
        nodeNetwork: {
          features,
          shouldServiceBlockPermissionRequests: isArchivist,
        },
        network: this.config.serverPort ? {
          port: this.config.serverPort
        } : null,
        originChainRepository: {
          data: path.resolve(nodeData, 'origin-chain')
        },
        networkProcedureCatalogue: {
          catalogue: [
            CatalogueItem.BOUND_WITNESS,
            CatalogueItem.TAKE_ORIGIN_CHAIN,
            CatalogueItem.GIVE_ORIGIN_CHAIN,
            CatalogueItem.TAKE_REQUESTED_BLOCKS,
            CatalogueItem.GIVE_REQUESTED_BLOCKS
          ]
        },
        archivistRepository: isArchivist ? {
          host: this.config.archivist!.sql.host,
          user: this.config.archivist!.sql.user,
          password: this.config.archivist!.sql.password,
          database: this.config.archivist!.sql.database,
          port: this.config.archivist!.sql.port,
        } : null,
        boundWitnessValidator: {
          checkPartyLengths: true,
          checkIndexExists: true,
          checkCountOfSignaturesMatchPublicKeysCount: true,
          validateSignatures: true,
          validateHash: true
        },
        aboutMeService: {
          ip: this.config.ip,
          boundWitnessServerPort: this.config.serverPort,
          graphqlPort: this.config.graphqlPort,
          version: '0.23.0',
          name: this.config.name
        },
        graphql: this.config.graphqlPort && this.config.apis.length > 0 ? {
          port: this.config.graphqlPort,
          apis: {
            about: this.config.apis.includes('about'),
            blockByHash: this.config.apis.includes('blockByHash'),
            entities: this.config.apis.includes('entities'),
            blockList: this.config.apis.includes('blockList'),
            blocksByPublicKey:this.config.apis.includes('blocksByPublicKey'),
            intersections: this.config.apis.includes('intersections'),
            transactionList: this.config.apis.includes('transactionList'),
          }
        } : null,
        web3Service: isDiviner && this.config.diviner ? {
          host: this.config.diviner.ethereum.host,
          address: this.config.diviner.ethereum.account,
          contracts: {
            PayOnDelivery: {
              address: this.config.diviner.ethereum.payOnDelivery
            }
          }
        } : null
      }
    })
    const managedProcessNode = new ProcessManager(newNode)
    managedProcessNode.manage(process)
  }

  private async writeConfigFile(yamlStr: string, config: IAppConfig, configFolder: string): Promise<void> {
    await createDirectoryIfNotExists(configFolder)
    const pathToWrite = path.resolve(configFolder, `${config.name}.yaml`)
    await writeFile(pathToWrite, yamlStr, 'utf8')
    return
  }
}

export async function main(args: string[]) {
  const appLauncher = new XyoAppLauncher()
  try {
    await appLauncher.initialize(args.length >= 3 ? args[2] : undefined)
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

if (require.main === module) {
  main(process.argv)
}
