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

import { XyoBase } from '@xyo-network/base'
import path from 'path'
import { intersection } from 'lodash'
import { ICreateConfigResult, IEthCryptoKeys, IArchivistConfig, IDivinerConfig } from './@types'
import { CreateConfigWizard } from './wizard/create-config'
import { NodeNameWizard } from './wizard/nodename'
import { DataPathWizard } from './wizard/datapath'
import { PublicIpAddressWizard } from './wizard/public-ip-address'
import { PortWizard } from './wizard/port'
import { BootstrapWizard } from './wizard/bootstrap'
import { ActAsServerWizard } from './wizard/act-as-server'
import { IpfsWizard, IIpfsConfig } from './wizard/ipfs.'
import { ComponentsWizard, XyoComponent } from './wizard/components'
import { SqlWizard } from './wizard/sql'
import { EthereumNodeAddressWizard } from './wizard/ethereum-node-address'
import { EthereumAccountWizard } from './wizard/ethereum-account'
import { ContractWizard, IContractConfig } from './wizard/contract'
import { ISqlArchivistRepositoryConfig } from '@xyo-network/archivist-repository-sql'
import { GraphqlWizard } from './wizard/graphql'
import { ApiWizard } from './wizard/api'
import { AutostartWizard } from './wizard/autostart'

export class AppWizard extends XyoBase {
  constructor(private readonly rootPath: string) {
    super()
  }

  public async createConfiguration(
    configNameSuggest?: string,
  ): Promise<ICreateConfigResult | undefined> {
    const doWizard = await new CreateConfigWizard().start()
    if (!doWizard) return undefined
    const nodeName = await new NodeNameWizard(configNameSuggest).start()
    const dataPath = await new DataPathWizard(path.resolve(this.rootPath, 'node-data')).start()
    const ip = await new PublicIpAddressWizard().start()
    const p2pPort = await new PortWizard(
      `What port would you like to use for your peer to peer protocol?`,
      11500,
    ).start()
    const bootstrapNodes = await new BootstrapWizard().start()
    const actAsServer = await new ActAsServerWizard().start()

    const serverPort = await (actAsServer
      ? new PortWizard(
          `What port would you like to use for your peer to peer protocol?`,
          11000,
        ).start()
      : Promise.resolve(undefined))

    const ipfs = await new IpfsWizard().start()

    const components = await new ComponentsWizard().start()
    let sqlCredentials: ISqlArchivistRepositoryConfig | undefined
    let ethereumNodeAddress: string | undefined
    let ethKeys: IEthCryptoKeys | undefined
    let xyStakingConsensus: IContractConfig | undefined
    let xyGovernance: IContractConfig | undefined
    let xyBlockProducer: IContractConfig | undefined

    if (components.includes(XyoComponent.ARCHIVIST)) {
      sqlCredentials = await new SqlWizard().start()
    }

    if (components.includes(XyoComponent.DIVINER)) {
      ethereumNodeAddress = await new EthereumNodeAddressWizard().start()
      ethKeys = await new EthereumAccountWizard(nodeName).start()
      xyStakingConsensus = await new ContractWizard('XyStakingConsensus').start()
      xyGovernance = await new ContractWizard('XyGovernance').start()
      xyBlockProducer = await new ContractWizard('XyBlockProducer').start()
    }

    const graphQLPort = await new GraphqlWizard().start()
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
      ? new ApiWizard(apiOptions).start()
      : (Promise.resolve([]) as Promise<string[]>))

    const startNode = await new AutostartWizard().start()

    let archivist: IArchivistConfig | undefined
    if (components.includes(XyoComponent.ARCHIVIST) && sqlCredentials) {
      archivist = {
        repository: sqlCredentials
      }
    }

    let diviner: IDivinerConfig | undefined
    if (
      components.includes(XyoComponent.DIVINER) &&
      ethKeys &&
      xyStakingConsensus &&
      xyGovernance &&
      xyBlockProducer
    ) {
      diviner = {
        ethereum: {
          host: ethereumNodeAddress!,
          account: ethKeys,
          contracts: {
            XyStakingConsensus: {
              ipfsHash: xyStakingConsensus.ipfsAddr,
              address: xyStakingConsensus.contractAddr,
            },
            XyGovernance: {
              ipfsHash: xyGovernance.ipfsAddr,
              address: xyGovernance.contractAddr,
            },
            XyBlockProducer: {
              ipfsHash: xyBlockProducer.ipfsAddr,
              address: xyBlockProducer.contractAddr,
            },
          },
        },
      }
    }

    return {
      startNode,
      config: {
        ip,
        p2pPort,
        apis,
        bootstrapNodes,
        serverPort,
        archivist,
        diviner,
        ipfs,
        graphqlPort: graphQLPort,
        data: dataPath,
        name: nodeName,
      },
    }
  }
}
