import { IXyoHasher } from '../hashing'
import { XyoOriginState } from './xyo-origin-state'
import { IXyoOriginBlockRepository } from '../persist/xyo-origin-block-repository'
import { IXyoOriginStateRepository } from '../persist/xyo-origin-state-repository'
import { XyoBoundWitness } from '../bound-witness'
import { XyoIterableStructure, XyoStructure, XyoSchema } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../schema'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import bs58 from 'bs58'

export class XyoBoundWitnessInserter extends XyoBase {
  private hasher: IXyoHasher
  private state: XyoOriginState
  private blockRepository: IXyoOriginBlockRepository

  constructor(hasher: IXyoHasher, state: XyoOriginState, blockRepo: IXyoOriginBlockRepository) {
    super()
    this.hasher = hasher
    this.state = state
    this.blockRepository = blockRepo
  }

  public async insert(boundWitness: XyoBoundWitness) {
    const bridgeBlocks = this.getNestedObjectType(boundWitness, XyoObjectSchema.WITNESS, XyoObjectSchema.BRIDGE_BLOCK_SET)
    const bridgeBlocksHashes = this.getNestedObjectType(boundWitness, XyoObjectSchema.FETTER, XyoObjectSchema.BRIDGE_HASH_SET)
    const rootBlockWithoutBridgedBlocks = this.removeBridgeBlocks(boundWitness)
    const hash = boundWitness.getHash(this.hasher)
    this.state.addOriginBlock(hash)

    this.logInfo(`Inserted new origin block with hash: ${bs58.encode(hash.getAll().getContentsCopy())}`)

    await this.state.repo.commit()

    // no need to await the add block, this can be async
    this.blockRepository.addOriginBlock(hash.getAll().getContentsCopy(), rootBlockWithoutBridgedBlocks.getAll().getContentsCopy())

    this.logInfo(`Origin state at new height: ${this.state.getIndexAsNumber()}`)

    if (bridgeBlocks && bridgeBlocksHashes) {
        // no need to await the add block, this can be async
      this.blockRepository.addOriginBlocks(bridgeBlocksHashes.getAll().getContentsCopy(), bridgeBlocks.getAll().getContentsCopy())
    }
  }

  private getNestedObjectType(boundWitness: XyoBoundWitness, rootSchema: XyoSchema, subSchema: XyoSchema): XyoStructure | undefined {
    const it = boundWitness.newIterator()

    while (it.hasNext()) {
      const bwItem = it.next().value

      if (bwItem.getSchema().id === rootSchema.id && bwItem instanceof XyoIterableStructure) {
        const fetterIt = bwItem.newIterator()

        while (fetterIt.hasNext()) {
          const fetterItem = fetterIt.next().value

          if (fetterItem.getSchema().id === subSchema.id) {
            return fetterItem
          }
        }
      }
    }

    return
  }

  private removeBridgeBlocks(boundWitness: XyoBoundWitness): XyoIterableStructure {
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
