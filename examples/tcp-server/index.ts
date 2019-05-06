import { XyoServerTcpNetwork, XyoFileOriginStateRepository, XyoMemoryBlockRepository, XyoZigZagBoundWitnessHander, XyoOriginPayloadConstructor, XyoBoundWitnessInserter, XyoOriginState, XyoSha256, IXyoProcedureCatalog, XyoNetworkHandler, XyoSecp2556k1, XyoGenesisBlockCreator, XyoCatalogFlags } from '../../dist'
import  { archivistProcedureCatalog } from './archivist-catalogue'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'

const main = async() => {
  const tcpNetwork = new XyoServerTcpNetwork(4141)
  const stateRepo = new XyoFileOriginStateRepository('./test-state.json')
  const blockRepo = new XyoMemoryBlockRepository()
  const state = new XyoOriginState(stateRepo)
  const hasher = new XyoSha256()
  const originChainInserter = new XyoBoundWitnessInserter(hasher, state, blockRepo)
  const payloadProvider = new XyoOriginPayloadConstructor(state)
  const handler = new XyoZigZagBoundWitnessHander(payloadProvider)

  state.addSigner(new XyoSecp2556k1())

  if (state.getIndexAsNumber() === 0) {
    const genesisBlock =  await XyoGenesisBlockCreator.create(state.getSigners(), payloadProvider)
    originChainInserter.insert(genesisBlock)
  }

  tcpNetwork.onPipeCreated = async(pipe) => {
    try {
      tcpNetwork.stopListening()
      const networkHandle = new XyoNetworkHandler(pipe)
      const boundWitness = await handler.boundWitness(networkHandle, archivistProcedureCatalog, state.getSigners())

      if (boundWitness) {
        originChainInserter.insert(boundWitness)
      }

      pipe.close()
    } catch (error) {
      console.log(error.stack)
      console.log(`Error creating bound witness: ${error}`)
    }
  }

  tcpNetwork.startListening()
}

main()
