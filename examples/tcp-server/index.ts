import { XyoServerTcpNetwork, XyoFileOriginStateRepository, XyoMemoryBlockRepository, XyoZigZagBoundWitnessHander, XyoOriginPayloadConstructor, XyoBoundWitnessInserter, XyoOriginState, XyoSha256, IXyoProcedureCatalogue, XyoNetworkHandler, XyoSecp2556k1, XyoGenesisBlockCreator, XyoCatalogueFlags } from '../../dist'

const archivistProcedureCatalogue: IXyoProcedureCatalogue = {
  getEncodedCanDo: () => {
    return Buffer.from([XyoCatalogueFlags.TAKE_ORIGIN_CHAIN | XyoCatalogueFlags.BOUND_WITNESS])
  },
  choose: (catalogue: Buffer): Buffer => {
    if (catalogue.length < 1) {
      throw new Error('Catalogue must have at least a byte')
    }

    const catalogueInt = catalogue.readUInt8(0)

    if ((catalogueInt & XyoCatalogueFlags.GIVE_ORIGIN_CHAIN) !== 0) {
      return new Buffer([XyoCatalogueFlags.TAKE_ORIGIN_CHAIN])
    }

    return new Buffer([XyoCatalogueFlags.BOUND_WITNESS])
  },
  canDo: (buffer: Buffer): boolean => {
    if (buffer.length < 1) {
      return false
    }

    const catalogueInt = buffer.readUInt8(0)
    return (catalogueInt & (XyoCatalogueFlags.GIVE_ORIGIN_CHAIN | XyoCatalogueFlags.BOUND_WITNESS)) !== 0
  }
}

const main = async () => {
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
    console.log(`Created genesis block with hash: ${genesisBlock.getHash(hasher).getAll().getContentsCopy().toString('hex')}`)
    originChainInserter.insert(genesisBlock)
  }

  tcpNetwork.onPipeCreated = async (pipe) => {
    console.log('New request!')
    try {
      const networkHandle = new XyoNetworkHandler(pipe)
      const boundWitness = await handler.boundWitness(networkHandle, archivistProcedureCatalogue, state.getSigners())

      if (boundWitness) {
        console.log(`Created bound witness with hash: ${boundWitness.getHash(hasher).getAll().getContentsCopy().toString('hex')}`)
        originChainInserter.insert(boundWitness)
      }
    } catch (error) {
      console.log(`Error creating bound witness: ${error}`)
    }
  }

  tcpNetwork.startListening()
}

main()
