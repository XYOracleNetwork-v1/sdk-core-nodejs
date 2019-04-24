import { XyoServerTcpNetwork, XyoFileOriginStateRepository, XyoMemoryBlockRepository, XyoZigZagBoundWitnessHander, XyoOriginPayloadConstructor, XyoBoundWitnessSuccessListener, XyoOriginState, XyoSha256, IXyoProcedureCatalogue, XyoNetworkHandler, XyoSecp2556k1 } from '../../dist'

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

const main = () => {
  const tcpNetwork = new XyoServerTcpNetwork(4141)
  const stateRepo = new XyoFileOriginStateRepository('./test-state.json')
  const blockRepo = new XyoMemoryBlockRepository()
  const state = new XyoOriginState(stateRepo)
  const hasher = new XyoSha256()
  const successListener = new XyoBoundWitnessSuccessListener(hasher, state, blockRepo)
  const payloadProvider = new XyoOriginPayloadConstructor(state)
  const handler = new XyoZigZagBoundWitnessHander(payloadProvider)

  state.addSigner(new XyoSecp2556k1())

  tcpNetwork.onPipeCreated = async (pipe) => {
    console.log('New request!')
    try {
      const networkHandle = new XyoNetworkHandler(pipe)
      const boundWitness = await handler.boundWitness(networkHandle, testProcedureCatalogue, state.getSigners())

      if (boundWitness) {
        console.log(`Created bound witness with hash: ${boundWitness.getHash(hasher).getAll().getContentsCopy().toString('hex')}`)
        successListener.onBoundWitnessCompleted(boundWitness)
      }
    } catch (error) {
      console.log(`Error creating bound witness: ${error}`)
    }
  }
}

main()
