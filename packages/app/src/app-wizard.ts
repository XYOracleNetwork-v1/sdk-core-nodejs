/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 11:27:20 am
 * @Email:  developer@xyfindables.com
 * @Filename: app-wizard.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 4:26:29 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { prompt } from 'enquirer'
import {
  validateNodeName,
  validateDataPath,
  validateIpAddress,
  IValidationResult,
  validatePort,
  validateURL,
  validateHexString,
  validateMultiAddress,
  validatePassword,
  promptValidator,
} from './validator'
import { writeFile, createDirectoryIfNotExists } from '@xyo-network/utils'
import { XyoBase } from '@xyo-network/base'
import path from 'path'
import { ISqlConnectionDetails } from '@xyo-network/archivist-repository.sql'
import { intersection } from 'lodash'
import { ICreateConfigResult, IEthCryptoKeys } from './@types'
import dns from 'dns'
import { XyoCryptoProvider } from '@xyo-network/crypto'

export async function getNameOfNode(
  configNameSuggest?: string,
): Promise<string> {
  // @ts-ignore
  const { nodeName } = await prompt<{ nodeName: string }>({
    type: 'input',
    message: `What would you like to name your XYO Node?`,
    name: 'nodeName',
    initial: configNameSuggest,
    validate: promptValidator(validateNodeName),
  })

  return nodeName
}

export async function getDataPath(initial: string): Promise<string> {
  // @ts-ignore
  const { dataPath } = await prompt<{ dataPath: string }>({
    initial,
    type: 'input',
    message: 'Where would you like to store your data?',
    name: 'dataPath',
    validate: promptValidator(validateDataPath),
  })

  return dataPath
}

export async function getPublicIpAddress(): Promise<string> {
  // @ts-ignore
  const { ipAddress } = await prompt<{ ipAddress: string }>({
    initial: '0.0.0.0',
    type: 'input',
    message: `What is your public ip address?`,
    name: 'ipAddress',
    validate: promptValidator(validateIpAddress),
  })

  return ipAddress
}

export async function getPort(message: string, initial: number) {
  // @ts-ignore
  const { port } = await prompt<{ port: number }>({
    message,
    type: 'input',
    initial: `${initial}`,
    name: 'port',
    float: false,
    validate: promptValidator(validatePort),
  })

  return parseInt(port, 10)
}

export async function doActAsServer() {
  // @ts-ignore
  const { actAsServer } = await prompt<{ actAsServer: string }>({
    initial: true,
    type: 'confirm',
    message: `Do you want your node to act as a server for doing bound-witnesses?`,
    name: 'actAsServer',
  })

  return actAsServer
}

export async function confirmCreateConfigWizard() {
  // @ts-ignore
  const { confirmWizard } = await prompt<{ confirmWizard: string }>({
    initial: true,
    type: 'confirm',
    message: `No config found, would you like to create one now?`,
    name: 'confirmWizard',
  })

  return confirmWizard
}

export async function getXyoComponents(): Promise<XyoComponent[]> {
  const { components } = await prompt<{ components: string }>({
    initial: true,
    type: 'select',
    choices: [
      XyoComponent.ARCHIVIST,
      XyoComponent.DIVINER,
      `${XyoComponent.ARCHIVIST} and ${XyoComponent.DIVINER}`,
    ],
    message: `Which component features do you want your Xyo Node to support?`,
    name: 'components',
  })

  // @ts-ignore
  const xyoComponents: XyoComponent[] = []
  if (components.includes(XyoComponent.ARCHIVIST)) {
    xyoComponents.push(XyoComponent.ARCHIVIST)
  }
  if (components.includes(XyoComponent.DIVINER)) {
    xyoComponents.push(XyoComponent.DIVINER)
  }

  return xyoComponents
}

export async function gatherSQLCredentials(): Promise<ISqlConnectionDetails> {
  const { host, user, password, database, port } = await prompt([
    {
      type: 'input',
      name: 'host',
      message: 'Enter the `host` value for your MySQL database',
      initial: '127.0.0.1',
    },
    {
      type: 'input',
      name: 'user',
      message: 'Enter the `user` value for your MySQL database',
      initial: 'admin',
    },
    {
      type: 'input',
      name: 'password',
      message: 'Enter the `password` value for your MySQL database',
      initial: 'password',
    },
    {
      type: 'input',
      name: 'database',
      message: 'Enter the `database` value for your MySQL database',
      initial: 'Xyo',
    },
    {
      type: 'input',
      name: 'port',
      message: 'Enter the `port` value for your MySQL database',
      initial: '3306',
    },
  ])

  return {
    host,
    user,
    password,
    database,
    port: parseInt(port, 10),
  }
}

export async function getEthereumNodeAddress(): Promise<string> {
  // @ts-ignore
  const { ethereumNodeAddress } = await prompt({
    type: 'input',
    name: 'ethereumNodeAddress',
    initial: 'http://127.0.0.1:8545',
    message: 'What is your Ethereum Node address?',
    validate: promptValidator(validateURL),
  })

  return ethereumNodeAddress
}

export async function getEthereumAccountAddress(
  nodeName: string
): Promise<IEthCryptoKeys> {
  // @ts-ignore
  const { ethereumAccountAddress } = await prompt<{ethereumAccountAddress: string }>({
    type: 'input',
    name: 'ethereumAccountAddress',
    message: 'What is your Ethereum address? This will start with `0x`',
    validate: promptValidator(validateHexString),
  })

  // @ts-ignore
  const { ethereumPrivateKey } = await prompt<{ ethereumPrivateKey: string }>({
    type: 'input',
    name: 'ethereumPrivateKey',
    message:
      'What is your Ethereum Private key? Diviners encrypt private keys and store encrypted copy locally.',
  })

  // @ts-ignore
  const { password } = await prompt<{ password: string }>({
    type: 'input',
    name: 'password',
    message: 'Please add a Diviner password.',
    validate: promptValidator(validatePassword),
  })

  const rootPath = path.resolve(__dirname, '..')
  const configFolder = path.resolve(rootPath, 'config')
  await createDirectoryIfNotExists(configFolder)
  const pathToWrite = path.resolve(configFolder, `${nodeName}.password`)
  await writeFile(pathToWrite, password, 'utf8')

  const provider = new XyoCryptoProvider()

  const { encrypted, salt } = provider.encrypt(password, ethereumPrivateKey)
  console.log('ENCRYPTED, SALT', encrypted, salt)
  return { salt, address: ethereumAccountAddress, encryptedKey: encrypted }
}

export async function getContractConfig(contract: string) {
  // @ts-ignore
  const { contractAddr } = await prompt<{ contractAddr: string }>({
    type: 'input',
    name: 'contractAddr',
    message: `What is the ${contract} contract address? This will start with \`0x\``,
    validate: promptValidator(validateHexString),
  })

  const { ipfsAddr } = await prompt<{ ipfsAddr: string }>({
    type: 'input',
    name: 'ipfsAddr',
    message: `What is the ${contract} IPFS address? This will start with \`Qm\``,
  })

  return { contractAddr, ipfsAddr }
}

export async function getIPFSConfig() {
  const { ipfsHost } = await prompt<{ ipfsHost: string }>({
    type: 'input',
    name: 'ipfsHost',
    message: 'What is the IPFS host value',
    initial: 'ipfs.layerone.co',
  })

  const ipfsPort = await getPort('What is the IPFS port value', 5002)

  const { ipfsProtocol } = await prompt<{ ipfsProtocol: string }>({
    initial: 'https',
    type: 'select',
    choices: ['https', 'http'],
    message: `What is the IPFS protocol?`,
    name: 'ipfsProtocol',
  })

  return { ipfsHost, ipfsPort, ipfsProtocol }
}

export async function getApiChoices(options: string[]): Promise<string[]> {
  const { choices } = await prompt<{ choices: string[] }>({
    type: 'multiselect',
    name: 'choices',
    message:
      'Which GraphQL api endpoints would you like to support? ' +
      '(use space-bar to toggle selection. Press enter once finished)',
    choices: options,
    initial: options,
  })

  return choices
}

export async function getBootstrapNodes(): Promise<string[]> {
  const bootstrapNodes: string[] = []
  const { confirmAddBootstrapNodes } = await prompt<{
    confirmAddBootstrapNodes: boolean
  }>({
    type: 'confirm',
    name: 'confirmAddBootstrapNodes',
    message: 'Do you want to add bootstrap nodes?',
    initial: true,
  })

  if (!confirmAddBootstrapNodes) return bootstrapNodes

  const dnsResults: string[] = await new Promise((resolve, reject) => {
    dns.lookup('peers.xyo.network', { all: true }, (err, results) => {
      if (err) return []
      return resolve(
        results.map((r) => {
          return `/ip4/${r.address}/tcp/11500`
        }),
      )
    })
  })

  if (dnsResults.length) {
    const { choices } = await prompt<{ choices: string[] }>({
      type: 'multiselect',
      name: 'choices',
      message:
        'These addresses were found on the `peers.xyo.network` DNS record.' +
        'You can select and deselect each address by pressing spacebar',
      choices: dnsResults,
      initial: dnsResults,
    })

    bootstrapNodes.push(...choices)
  }

  await getMultiAddrEntry(bootstrapNodes)

  // Returns the unique keys
  return Object.keys(
    bootstrapNodes.reduce((memo: { [s: string]: boolean }, k) => {
      memo[k] = true
      return memo
    }, {}),
  )
}

export async function getMultiAddrEntry(
  bootstrapNodes: string[],
): Promise<void> {
  const { confirmAddIndividualIps } = await prompt<{
    confirmAddIndividualIps: boolean
  }>({
    type: 'confirm',
    name: 'confirmAddIndividualIps',
    message: 'Do you want to add any more individual bootstrap nodes?',
    initial: false,
  })

  if (!confirmAddIndividualIps) return

  // @ts-ignore
  const { ipAddress } = await prompt<{ ipAddress: string }>({
    type: 'input',
    message: `What is the address value of the bootstrap node? Should look something like /ip4/127.0.0.1/tcp/11500`,
    name: 'ipAddress',
    validate: promptValidator(validateMultiAddress),
  })

  bootstrapNodes.push(ipAddress)
  await getMultiAddrEntry(bootstrapNodes)
}

export async function getGraphQLPort(): Promise<number | undefined> {
  // @ts-ignore
  const { confirmGraphQL } = await prompt<{ confirmGraphQL: boolean }>({
    initial: true,
    type: 'confirm',
    message: `Do you want your node to have a GraphQL server`,
    name: 'confirmGraphQL',
  })

  if (!confirmGraphQL) {
    return undefined
  }

  return getPort('What port should your GraphQL server run on?', 11001)
}

export async function startNodeAfterInitialize() {
  const { start } = await prompt<{ start: boolean }>({
    message: 'Do you want to start the node after configuration is complete?',
    initial: true,
    type: 'confirm',
    name: 'start',
  })

  return start
}

export class AppWizard extends XyoBase {
  constructor(private readonly rootPath: string) {
    super()
  }

  public async createConfiguration(
    configNameSuggest?: string,
  ): Promise<ICreateConfigResult | undefined> {
    const doWizard = await confirmCreateConfigWizard()
    if (!doWizard) return undefined
    const nodeName = await getNameOfNode(configNameSuggest)
    const dataPath = await getDataPath(path.resolve(this.rootPath, 'node-data'))
    const ip = await getPublicIpAddress()
    const p2pPort = await getPort(
      `What port would you like to use for your peer to peer protocol?`,
      11500,
    )
    const bootstrapNodes = await getBootstrapNodes()
    const actAsServer = await doActAsServer()

    const serverPort = await (actAsServer
      ? getPort(
          `What port would you like to use for your peer to peer protocol?`,
          11000,
        )
      : Promise.resolve(undefined))

    const { ipfsHost, ipfsPort, ipfsProtocol } = await getIPFSConfig()

    const components = await getXyoComponents()

    const sqlCredentials = await (components.includes(XyoComponent.ARCHIVIST)
      ? gatherSQLCredentials()
      : Promise.resolve(undefined))

    const ethereumNodeAddress = await (components.includes(XyoComponent.DIVINER)
      ? getEthereumNodeAddress()
      : Promise.resolve(undefined))

    const ethKeys = await (components.includes(XyoComponent.DIVINER)
      ? getEthereumAccountAddress(nodeName)
      : Promise.resolve(undefined))

    // tslint:disable-next-line:variable-name
    const XyStakingConsensus = await (components.includes(XyoComponent.DIVINER)
      ? getContractConfig('XyStakingConsensus')
      : Promise.resolve(undefined))

    // tslint:disable-next-line:variable-name
    const XyGovernance = await (components.includes(XyoComponent.DIVINER)
      ? getContractConfig('XyGovernance')
      : Promise.resolve(undefined))

    // tslint:disable-next-line:variable-name
    const XyBlockProducer = await (components.includes(XyoComponent.DIVINER)
      ? getContractConfig('XyBlockProducer')
      : Promise.resolve(undefined))

    const graphQLPort = await getGraphQLPort()
    const apiOptions = [
      { name: 'about', exclusiveTo: [] },
      { name: 'blockByHash', exclusiveTo: [] },
      { name: 'blockList', exclusiveTo: [] },
      { name: 'intersections', exclusiveTo: [XyoComponent.ARCHIVIST] },
      { name: 'blocksByPublicKey', exclusiveTo: [XyoComponent.ARCHIVIST] },
      { name: 'entities', exclusiveTo: [XyoComponent.ARCHIVIST] },
      { name: 'transactionList', exclusiveTo: [XyoComponent.DIVINER] },
    ]
      .filter((choice) => {
        if (choice.exclusiveTo.length === 0) return true
        return intersection(choice.exclusiveTo, components).length > 0
      })
      .map(a => a.name)

    const apis = await (graphQLPort
      ? getApiChoices(apiOptions)
      : (Promise.resolve([]) as Promise<string[]>))
    const startNode = await startNodeAfterInitialize()

    return {
      startNode,
      config: {
        ip,
        p2pPort,
        apis,
        bootstrapNodes,
        serverPort: serverPort || null,
        graphqlPort: graphQLPort || null,
        data: dataPath,
        name: nodeName,
        archivist: components.includes(XyoComponent.ARCHIVIST)
          ? {
            sql: sqlCredentials!,
          }
          : null,
        diviner:
          components.includes(XyoComponent.DIVINER) &&
          ethKeys &&
          XyStakingConsensus &&
          XyGovernance &&
          XyBlockProducer
            ? {
              ethereum: {
                host: ethereumNodeAddress!,
                account: ethKeys,
                contracts: {
                  XyStakingConsensus: {
                    ipfsHash: XyStakingConsensus.ipfsAddr,
                    address: XyStakingConsensus.contractAddr,
                  },
                  XyGovernance: {
                    ipfsHash: XyGovernance.ipfsAddr,
                    address: XyGovernance.contractAddr,
                  },
                  XyBlockProducer: {
                    ipfsHash: XyBlockProducer.ipfsAddr,
                    address: XyBlockProducer.contractAddr,
                  },
                },
              },
            }
            : null,
        ipfs: {
          host: ipfsHost,
          port: String(ipfsPort),
          protocol: ipfsProtocol,
        },
      },
    }
  }
}

enum XyoComponent {
  ARCHIVIST = 'archivist',
  DIVINER = 'diviner',
}
