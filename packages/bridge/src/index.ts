import { XyoLogger } from '@xyo-network/logger'
import { resolvers, IResolvers, XyoNode, IXyoNodeOptions, IXyoNetworkConfig, IXyoNodeConfig } from '@xyo-network/base-node'
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { XyoOriginChainStateInMemoryRepository } from '@xyo-network/origin-chain'
import { NobleScan } from '@xyo-network/ble.noble'
import { serializer } from '@xyo-network/serializer'
import { XyoBluetoothNetwork } from '@xyo-network/network.ble'
import { getSignerProvider } from '@xyo-network/signing.ecdsa'
import { IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoProvider } from '@xyo-network/utils'
import { IXyoNetworkProcedureCatalogue, CatalogueItem, IXyoNetworkProvider } from '@xyo-network/network'

new XyoLogger(false, false).info("Bridge!")

const signers: IXyoSigner[] = [getSignerProvider("secp256k1-sha256").newInstance()]
const scanner = new NobleScan()

async function main() {
  const bleNetwork = new XyoBluetoothNetwork(scanner)

  const network: IXyoProvider<IXyoNetworkProvider, IXyoNetworkConfig> = {
    async get(container, config) {
      return bleNetwork
    }
  }

  const configN: IXyoNodeConfig = {
    data: {
      path: './node-db'
    },
    archivistRepository: {
      host: '127.0.0.1',
      user: 'root',
      password: '1337',
      database: 'Xyo',
      port: 3306
    },
  }

  const node = new XyoNode({
    modules: {
      [IResolvers.NETWORK]: network
    },
    config: configN
  })

  await node.initialize()
  await node.start()

  // resolvers: {
  //   [IResolvers.NETWORK]: network
  // }

  // const payload: IXyoPayload = {
  //   heuristics: [],
  //   metadata: []
  // }
  // const proced: IXyoNetworkProcedureCatalogue = {
  //   canDo (cat: CatalogueItem) {
  //     return true
  //   },

  //   getCurrentCatalogue(): CatalogueItem[] {
  //     throw Error("stun")
  //   },

  //   setCatalogue(catalogue: CatalogueItem[]): void {
  //     throw Error("stun")
  //   }
  // }

  // const doEr = new XyoBoundWitnessStandardClientInteraction(signers, payload, serializer)
  // const pipe = await network.find(proced)
  // const bw = await doEr.performInteraction(pipe)
}

setTimeout(main, 2000)
