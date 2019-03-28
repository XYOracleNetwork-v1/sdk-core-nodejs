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
import { prompt } from 'enquirer'
import { XyoNode } from '@xyo-network/base-node'
import {
  ProcessManager,
  fileExists,
  readFile,
  writeFile,
  createDirectoryIfNotExists,
} from '@xyo-network/utils'
import { XyoBase } from '@xyo-network/base'
import path from 'path'
import { AppWizard } from './app-wizard'
import { IAppConfig, IEthCryptoKeys } from './@types'
import yaml, { safeDump } from 'js-yaml'
import {
  validateConfigFile,
  validatePassword,
  IValidationResult,
  promptValidator,
} from './validator'
import { XyoCryptoProvider } from '@xyo-network/crypto'

import { XyoError, XyoErrors } from '@xyo-network/errors'
import { CatalogueItem } from '@xyo-network/network'
import { IXyoComponentFeatureResponse } from '@xyo-network/node-network'
export class XyoAppLauncher extends XyoBase {
  public config: IAppConfig | undefined
  public yamlConfig: string | undefined
  public startNode = true

  private password?: string
  private isForever = false

  public setForeverPass(pass: string) {
    this.password = pass
    this.isForever = true
  }
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
        if (this.isForever) {
          throw new XyoError(`Config file not found running forever`)
        }
        this.logInfo(`Could not find a configuration file at ${configPath}`)
        const res = await new AppWizard(rootPath).createConfiguration(
          configName,
        )
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
      throw new XyoError(
        `There was an error in your config file ${message}. Exiting`,
      )
    }
    if (writeConfigFile) {
      this.yamlConfig = safeDump(JSON.parse(JSON.stringify(this.config)))
      await this.writeConfigFile(this.yamlConfig, this.config, configFolder)
    }
  }

  public async start() {
    if (!this.config) throw new XyoError(`Config not initialized`)

    const nodeData = path.resolve(this.config.data, this.config.name)
    const isArchivist = Boolean(this.config.archivist)
    const isDiviner = Boolean(this.config.diviner)

    if (!isArchivist && !isDiviner) {
      throw new XyoError(
        `Must support at least archivist or diviner functionality`,
      )
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
          boundWitnessPort: this.config.serverPort,
        },
      }
    }

    if (isDiviner) {
      features.diviner = {
        featureType: 'diviner',
        supportsFeature: true,
        featureOptions: {},
      }
    }
    await this.addPidToPidsFolder()
    const newNode = new XyoNode({
      config: {
        nodeRunnerDelegates: {
          enableBoundWitnessServer: Boolean(this.config.serverPort),
          enableGraphQLServer: Boolean(
            this.config.graphqlPort && this.config.apis.length > 0,
          ),
          enableQuestionsWorker: isDiviner,
          enableBlockProducer: isDiviner,
          enableBlockWitness: isDiviner,
        },
        blockProducer: isDiviner
          ? {
            accountAddress: this.config.diviner!.ethereum.account.address,
          }
          : null,
        data: {
          path: nodeData,
        },
        discovery: {
          bootstrapNodes: this.config.bootstrapNodes,
          publicKey: this.config.name,
          address: `/ip4/${this.config.ip}/tcp/${this.config.p2pPort}`,
        },
        peerTransport: {
          address: `/ip4/${this.config.ip}/tcp/${this.config.p2pPort}`,
        },
        nodeNetworkFrom: {
          features,
          shouldServiceBlockPermissionRequests: isArchivist,
        },
        network: this.config.serverPort
          ? {
            port: this.config.serverPort,
          }
          : null,
        originChainRepository: {
          data: path.resolve(nodeData, 'origin-chain'),
        },
        networkProcedureCatalogue: {
          catalogue: [
            CatalogueItem.BOUND_WITNESS,
            CatalogueItem.TAKE_ORIGIN_CHAIN,
            CatalogueItem.GIVE_ORIGIN_CHAIN,
            CatalogueItem.TAKE_REQUESTED_BLOCKS,
            CatalogueItem.GIVE_REQUESTED_BLOCKS,
          ],
        },
        archivistRepository: isArchivist
          ? {
            host: this.config.archivist!.sql.host,
            user: this.config.archivist!.sql.user,
            password: this.config.archivist!.sql.password,
            database: this.config.archivist!.sql.database,
            port: this.config.archivist!.sql.port,
          }
          : null,
        boundWitnessValidator: {
          checkPartyLengths: true,
          checkIndexExists: true,
          checkCountOfSignaturesMatchPublicKeysCount: true,
          validateSignatures: true,
          validateHash: true,
        },
        aboutMeService: {
          ip: this.config.ip,
          boundWitnessServerPort: this.config.serverPort,
          graphqlPort: this.config.graphqlPort,
          version: '0.23.0',
          name: this.config.name,
        },
        graphql:
          this.config.graphqlPort && this.config.apis.length > 0
            ? {
              port: this.config.graphqlPort,
              apis: {
                about: this.config.apis.includes('about'),
                blockByHash: this.config.apis.includes('blockByHash'),
                entities: this.config.apis.includes('entities'),
                blockList: this.config.apis.includes('blockList'),
                blocksByPublicKey: this.config.apis.includes(
                    'blocksByPublicKey',
                  ),
                intersections: this.config.apis.includes('intersections'),
                transactionList: this.config.apis.includes('transactionList'),
              },
            }
            : null,
        web3Service:
          isDiviner && this.config.diviner
            ? {
              host: this.config.diviner.ethereum.host,
              address: this.config.diviner.ethereum.account.address,
              privateKey: this.config.diviner.ethereum.account.privateKey
                  ? this.config.diviner.ethereum.account.privateKey
                  : await this.decryptPrivateKey(
                      this.config.diviner.ethereum.account,
                    ),
              contracts: this.config.diviner.ethereum.contracts,
            }
            : null,
        contentAddressableService: {
          host: this.config.ipfs.host,
          port: this.config.ipfs.port,
          protocol: this.config.ipfs.protocol,
        },
        transactionRepository: {
          data: path.resolve(nodeData, 'transactions'),
        },
      },
    })
    const managedProcessNode = new ProcessManager(newNode)
    managedProcessNode.manage(process)
  }

  private async decryptPrivateKey(crypto: IEthCryptoKeys): Promise<string> {
    if (!crypto.encryptedKey || !crypto.salt) {
      throw new Error(
        'No private ethereum key saved in configuration, run setup again',
      )
    }
    const provider = new XyoCryptoProvider()
    let tryAgain = false

    // password passed in start command
    if (!this.password) {
      tryAgain = true
      // @ts-ignore
      const { password } = await prompt<{ password }>({
        type: 'input',
        name: 'password',
        message: 'What is your Diviner password?',
        validate: promptValidator(validatePassword),
      })
      this.password = password
    }

    try {
      const privateKey = provider.decrypt(
        this.password!,
        crypto.encryptedKey,
        crypto.salt,
      )
      return privateKey
    } catch (e) {
      this.logError(`Incorrect password,  try again.`, e)
      if (!tryAgain) {
        process.exit(1)
      }
    }
    return this.decryptPrivateKey(crypto)
  }

  private async addPidToPidsFolder() {
    try {
      const pidFolder = path.resolve(__dirname, '..', 'pids')
      await createDirectoryIfNotExists(pidFolder)
      await writeFile(
        path.resolve(pidFolder, `${this.config!.name}.pid`),
        process.pid,
        { encoding: 'utf8' },
      )
    } catch (e) {
      this.logError(`There was an updating the pids folder`, e)
      throw e
    }
  }

  private async writeConfigFile(
    yamlStr: string,
    config: IAppConfig,
    configFolder: string,
  ): Promise<void> {
    await createDirectoryIfNotExists(configFolder)
    const pathToWrite = path.resolve(configFolder, `${config.name}.yaml`)
    await writeFile(pathToWrite, yamlStr, 'utf8')
    return
  }
}

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

if (require.main === module) {
  main(process.argv)
}
