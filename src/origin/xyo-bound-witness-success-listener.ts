import { IXyoHasher } from '../hashing'
import { XyoOriginState } from './xyo-origin-state'
import { IXyoOriginBlockRepository } from '../persist/xyo-origin-block-repository'
import { IXyoOriginStateRepository } from '../persist/xyo-origin-state-repository'
import { XyoBoundWitness } from '../bound-witness'
import { XyoIterableStructure, XyoStructure, XyoSchema } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../schema'

export class XyoBoundWitnessSuccessListener {
  private hasher: IXyoHasher
  private state: XyoOriginState
  private blockRepository: IXyoOriginBlockRepository

  constructor(hasher: IXyoHasher, stateRepo: IXyoOriginStateRepository, blockRepo: IXyoOriginBlockRepository) {
    this.hasher = hasher
    this.state = new XyoOriginState(stateRepo)
    this.blockRepository = blockRepo
  }

  public async onBoundWitnessCompleted (boundWitness: XyoBoundWitness) {
    const bridgeBlocks = this.getBridgeBlocks(boundWitness)
    const rootBlockWithoutBridgedBlocks = this.removeBridgeBlocks(boundWitness)
    const hash = boundWitness.getHash(this.hasher)
    this.state.addOriginBlock(hash)
    await this.state.repo.commit()
    await this.blockRepository.addOriginBlock(hash.getContents().getContentsCopy(), rootBlockWithoutBridgedBlocks.getContents().getContentsCopy())

    for (const subBlock of bridgeBlocks) {
      const subHash = subBlock.getHash(this.hasher)
      await this.blockRepository.addOriginBlock(subHash.getContents().getContentsCopy(), subBlock.getContents().getContentsCopy())
    }
  }

  private getBridgeBlocks (boundWitness: XyoBoundWitness): XyoBoundWitness[] {
    const toReturn: XyoBoundWitness[] = []
    const it = boundWitness.newIterator()

    while (it.hasNext()) {
      const bwItem = it.next().value

      if (bwItem.getSchema().id === XyoObjectSchema.WITNESS.id && bwItem instanceof XyoIterableStructure) {
        const witnessIt = bwItem.newIterator()

        while (witnessIt.hasNext()) {
          const witnessItem = witnessIt.next().value

          if (witnessItem.getSchema().id === XyoObjectSchema.BRIDGE_BLOCK_SET.id && witnessItem instanceof XyoIterableStructure) {
            const blockIt = witnessItem.newIterator()

            while (blockIt.hasNext()) {
              toReturn.push(new XyoBoundWitness(blockIt.next().value.getContents()))
            }
          }
        }
      }
    }

    return toReturn
  }

  private removeBridgeBlocks (boundWitness: XyoBoundWitness): XyoIterableStructure {
    const newLedgerItems: XyoStructure[] = []
    const it = boundWitness.newIterator()

    while (it.hasNext()) {
      const bwItem = it.next().value

      if (bwItem.getSchema().id === XyoObjectSchema.WITNESS.id && bwItem instanceof XyoIterableStructure) {
        const witnessIt = bwItem.newIterator()
        const newWitnessItems: XyoStructure[] = []

        while (witnessIt.hasNext()) {
          const witnessItem = witnessIt.next().value

          if (witnessItem.getSchema().id !== XyoObjectSchema.BRIDGE_BLOCK_SET.id) {
            newWitnessItems.push(witnessItem)
          }
        }

        newLedgerItems.push(XyoIterableStructure.newIterable(XyoObjectSchema.WITNESS, newWitnessItems))
      } else {
        newLedgerItems.push(bwItem)
      }
    }

    return XyoIterableStructure.newIterable(XyoObjectSchema.BW, newLedgerItems)
  }
}
