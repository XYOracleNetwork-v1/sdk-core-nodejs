/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 11:27:20 am
 * @Email:  developer@xyfindables.com
 * @Filename: app-wizard.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 19th February 2019 1:59:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { prompt } from 'enquirer'
import { validateNodeName, validateDataPath, validateIpAddress, IValidationResult, validatePort, validateURL, validateHexString } from './validator'
import { XyoBase } from '@xyo-network/base'
import path from 'path'
import { ISqlConnectionDetails } from '@xyo-network/archivist-repository.sql'
import { intersection } from 'lodash'
import { IAppConfig } from './@types'

function promptValidator<T>(validator: (val: T) => Promise<IValidationResult>) {
  return async (v: T) => {
    const { validates, message } = await validator(v)
    if (validates) return true
    return message!
  }
}

export async function getNameOfNode(configNameSuggest?: string): Promise<string> {
  // @ts-ignore
  const { nodeName } = await prompt<{nodeName: string}>({
    type: 'input',
    message: `What would you like to name your XYO Node?`,
    name: 'nodeName',
    initial: configNameSuggest,
    validate: promptValidator(validateNodeName)
  })

  return nodeName
}

export async function getDataPath(initial: string): Promise<string> {
  // @ts-ignore
  const { dataPath } = await prompt<{dataPath: string}>({
    initial,
    type: 'input',
    message: 'Where would you like to store your data?',
    name: 'dataPath',
    validate: promptValidator(validateDataPath)
  })

  return dataPath
}

export async function getPublicIpAddress(): Promise<string> {
 // @ts-ignore
  const { ipAddress } = await prompt<{ipAddress: string}>({
    initial: '0.0.0.0',
    type: 'input',
    message: `What is your public ip address?`,
    name: 'ipAddress',
    validate: promptValidator(validateIpAddress)
  })

  return ipAddress
}

export async function getPort(message: string, initial: number) {
 // @ts-ignore
  const { port } = await prompt<{port: number}>({
    message,
    type: 'input',
    initial: `${initial}`,
    name: 'port',
    float: false,
    validate: promptValidator(validatePort)
  })

  return parseInt(port, 10)
}

export async function doActAsServer() {
 // @ts-ignore
  const { actAsServer } = await prompt<{actAsServer: string}>({
    initial: true,
    type: 'confirm',
    message: `Do you want your node to act as a server for doing bound-witnesses?`,
    name: 'actAsServer'
  })

  return actAsServer
}

export async function confirmCreateConfigWizard() {
 // @ts-ignore
  const { confirmWizard } = await prompt<{confirmWizard: string}>({
    initial: true,
    type: 'confirm',
    message: `No config found, would you like to create one now?`,
    name: 'confirmWizard'
  })

  return confirmWizard
}

export async function getXyoComponents(): Promise<XyoComponent[]> {
  const { components } = await prompt<{components: string}>({
    initial: true,
    type: 'select',
    choices: [XyoComponent.ARCHIVIST, XyoComponent.DIVINER, `${XyoComponent.ARCHIVIST} and ${XyoComponent.DIVINER}`],
    message: `Which component features do you want your Xyo Node to support?`,
    name: 'components'
  })

  // @ts-ignore
  const xyoComponents: XyoComponent[] = []
  if (components.includes(XyoComponent.ARCHIVIST)) xyoComponents.push(XyoComponent.ARCHIVIST)
  if (components.includes(XyoComponent.DIVINER)) xyoComponents.push(XyoComponent.DIVINER)

  return xyoComponents
}

export async function gatherSQLCredentials(): Promise<ISqlConnectionDetails> {
  const { host, user, password, database, port } = await prompt([
    {
      type: 'input',
      name: 'host',
      message: 'Enter the `host` value for your MySQL database',
      initial: '127.0.0.1'
    },
    {
      type: 'input',
      name: 'user',
      message: 'Enter the `user` value for your MySQL database',
      initial: 'admin'
    },
    {
      type: 'input',
      name: 'password',
      message: 'Enter the `password` value for your MySQL database',
      initial: 'password'
    },
    {
      type: 'input',
      name: 'database',
      message: 'Enter the `database` value for your MySQL database',
      initial: 'Xyo'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Enter the `port` value for your MySQL database',
      initial: '3306'
    },
  ])

  return {
    host,
    user,
    password,
    database,
    port: parseInt(port, 10)
  }
}

export async function getEthereumNodeAddress(): Promise<string> {
  // @ts-ignore
  const { ethereumNodeAddress } = await prompt({
    type: 'input',
    name: 'ethereumNodeAddress',
    initial: 'http://127.0.0.1:8545',
    message: 'What is your Ethereum Node address?',
    validate: promptValidator(validateURL)
  })

  return ethereumNodeAddress
}

export async function getEthereumAccountAddress(): Promise<string> {
    // @ts-ignore
  const { ethereumAccountAddress } = await prompt<{ethereumAccountAddress: string}>({
    type: 'input',
    name: 'ethereumAccountAddress',
    message: 'What is your Ethereum Account address? This will start with `0x`',
    validate: promptValidator(validateHexString)
  })

  return ethereumAccountAddress
}

export async function getPayOnDeliveryAddress(): Promise<string> {
    // @ts-ignore
  const { payOnDeliveryAddress } = await prompt<{payOnDeliveryAddress: string}>({
    type: 'input',
    name: 'payOnDeliveryAddress',
    message: 'What is the PayOnDelivery contract address? This will start with `0x`',
    validate: promptValidator(validateHexString)
  })

  return payOnDeliveryAddress
}

export async function getApiChoices(options: string[]): Promise<string[]> {
  const { choices } = await prompt<{choices: string[]}>({
    type: 'multiselect',
    name: 'choices',
    message: 'Which GraphQL api endpoints would you like to support? ' +
      '(use space-bar to toggle selection. Press enter once finished)',
    choices: options,
    initial: options
  })

  return choices
}

export async function getGraphQLPort(): Promise<number | undefined> {
 // @ts-ignore
  const { confirmGraphQL } = await prompt<{confirmGraphQL: boolean}>({
    initial: true,
    type: 'confirm',
    message: `Do you want your node to have a GraphQL server`,
    name: 'confirmGraphQL'
  })

  if (!confirmGraphQL) {
    return undefined
  }

  return getPort('What port should your GraphQL server run on?', 11001)
}

export class AppWizard extends XyoBase {

  constructor (private readonly rootPath: string) {
    super()
  }

  public async createConfiguration(configNameSuggest?: string): Promise<IAppConfig | undefined> {
    const doWizard = await confirmCreateConfigWizard()
    if (!doWizard) return undefined
    const nodeName = await getNameOfNode(configNameSuggest)
    const dataPath = await getDataPath(path.resolve(this.rootPath, 'node-data'))
    const ip = await getPublicIpAddress()
    const p2pPort = await getPort(`What port would you like to use for your peer to peer protocol?`, 11500)
    const actAsServer = await doActAsServer()

    const serverPort = await (actAsServer ?
      getPort(`What port would you like to use for your peer to peer protocol?`, 11000) :
      Promise.resolve(undefined)
    )

    const components = await getXyoComponents()

    const sqlCredentials = await (components.includes(XyoComponent.ARCHIVIST) ?
      gatherSQLCredentials() :
      Promise.resolve(undefined)
    )

    const ethereumNodeAddress = await (components.includes(XyoComponent.DIVINER) ?
      getEthereumNodeAddress() :
      Promise.resolve(undefined)
    )

    const ethereumAccountAddress = await (components.includes(XyoComponent.DIVINER) ?
      getEthereumAccountAddress() :
      Promise.resolve(undefined)
    )

    const payOnDeliveryAddress = await (components.includes(XyoComponent.DIVINER) ?
      getPayOnDeliveryAddress() :
      Promise.resolve(undefined)
    )

    const graphQLPort = await getGraphQLPort()
    const apiOptions = [
      { name: 'about', exclusiveTo: [] },
      { name: 'blockByHash', exclusiveTo: [] },
      { name: 'blockList', exclusiveTo: [] },
      { name: 'intersections', exclusiveTo: [XyoComponent.ARCHIVIST] },
      { name: 'blocksByPublicKey', exclusiveTo: [XyoComponent.ARCHIVIST] },
      { name: 'entities', exclusiveTo: [XyoComponent.ARCHIVIST] },
      { name: 'transactionList', exclusiveTo: [XyoComponent.DIVINER] }
    ]
    .filter((choice) => {
      if (choice.exclusiveTo.length === 0) return true
      return intersection(choice.exclusiveTo, components).length > 0
    })
    .map(a => a.name)

    const apis = await (graphQLPort ? getApiChoices(apiOptions) : Promise.resolve([]) as Promise<string[]>)

    this.logInfo(`Node name: ${nodeName}`)
    this.logInfo(`Data path: ${dataPath}`)
    this.logInfo(`IP: ${ip}`)
    this.logInfo(`P2P Port: ${p2pPort}`)
    this.logInfo(`Serve Bound-Witness: ${actAsServer}`)

    if (serverPort) this.logInfo(`Server Port: ${serverPort}`)

    this.logInfo(`Xyo Components: ${components}`)

    if (sqlCredentials) this.logInfo(`SQL Credentials: ${JSON.stringify(sqlCredentials, null, 2)}`)
    if (ethereumNodeAddress) this.logInfo(`Ethereum Node Address: ${ethereumNodeAddress}`)
    if (ethereumAccountAddress) this.logInfo(`Ethereum Account Address: ${ethereumAccountAddress}`)
    if (payOnDeliveryAddress) this.logInfo(`PayOnDelivery Contract Address: ${payOnDeliveryAddress}`)
    if (apis.length) this.logInfo(`APIs: ${apis.join(', ')}`)

    return {
      ip,
      p2pPort,
      apis,
      serverPort: serverPort || null,
      graphqlPort: graphQLPort || null,
      data: dataPath,
      name: nodeName,
      archivist: components.includes(XyoComponent.ARCHIVIST) ? {
        sql: sqlCredentials!
      } : null,
      diviner: components.includes(XyoComponent.DIVINER) ? {
        ethereum: {
          host: ethereumNodeAddress!,
          account: ethereumAccountAddress!,
          payOnDelivery: payOnDeliveryAddress!

        }
      } : null
    }
  }
}

enum XyoComponent {
  ARCHIVIST = 'archivist',
  DIVINER = 'diviner'
}
