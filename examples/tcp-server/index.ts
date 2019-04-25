import { XyoServerTcpNetwork, XyoFileOriginStateRepository, XyoMemoryBlockRepository, XyoZigZagBoundWitnessHander, XyoOriginPayloadConstructor, XyoBoundWitnessSuccessListener, XyoOriginState, XyoSha256, IXyoProcedureCatalogue, XyoNetworkHandler, XyoSecp2556k1, XyoGenesisBlockCreator } from '../../dist'

const testProcedureCatalogue: IXyoProcedureCatalogue = {
  getEncodedCanDo: () => {
    return Buffer.from('01', 'hex')
  },
  choose: () => {
    return Buffer.from('01', 'hex')
  },
  canDo: (buffer: Buffer) => {
    return true
  }
}

const main = async () => {
  const tcpNetwork = new XyoServerTcpNetwork(4141)
  const stateRepo = new XyoFileOriginStateRepository('./test-state.json')
  const blockRepo = new XyoMemoryBlockRepository()
  const state = new XyoOriginState(stateRepo)
  const hasher = new XyoSha256()
  const successListener = new XyoBoundWitnessInserter(hasher, state, blockRepo)
  const payloadProvider = new XyoOriginPayloadConstructor(state)
  const handler = new XyoZigZagBoundWitnessHander(payloadProvider)

  state.addSigner(new XyoSecp2556k1())

  if (state.getIndexAsNumber() === 0) {
    const genesisBlock =  await XyoGenesisBlockCreator.create(state.getSigners(), payloadProvider)
    console.log(`Created genesis block with hash: ${genesisBlock.getHash(hasher).getAll().getContentsCopy().toString('hex')}`)
    successListener.insert(genesisBlock)
  }

  tcpNetwork.onPipeCreated = async (pipe) => {
    console.log('New request!')
    try {
      const networkHandle = new XyoNetworkHandler(pipe)
      const boundWitness = await handler.boundWitness(networkHandle, testProcedureCatalogue, state.getSigners())

      if (boundWitness) {
        console.log(`Created bound witness with hash: ${boundWitness.getHash(hasher).getAll().getContentsCopy().toString('hex')}`)
        successListener.insert(boundWitness)
      }
    } catch (error) {
      console.log(`Error creating bound witness: ${error}`)
    }
  }

  tcpNetwork.startListening()
}

main()
