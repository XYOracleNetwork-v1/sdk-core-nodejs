import { IXyoHasher } from '../hashing'
import { XyoOriginState } from './xyo-origin-state'
import { IXyoOriginBlockRepository } from '../persist/xyo-origin-block-repository'
import { IXyoOriginStateRepository } from '../persist/xyo-origin-state-repository'
import { XyoBoundWitness } from '../bound-witness'
import { XyoZigZagBoundWitnessSession } from '../bound-witness/xyo-zig-zag-bound-witness-session'
import { XyoNetworkHandler } from '../network/xyo-network-handler'
import { IXyoProcedureCatalogue } from '../network/xyo-procedure-catalogue'
import { XyoChoicePacket } from '../network/xyo-choice-packet'
import { XyoIterableStructure, XyoBuffer } from '@xyo-network/object-model'

export class XyoOriginChain {
  private hasher: IXyoHasher
  private state: XyoOriginState
  private blockRepository: IXyoOriginBlockRepository
  private currentBoundWitnessSession: XyoZigZagBoundWitnessSession | undefined

  constructor(hasher: IXyoHasher, stateRepo: IXyoOriginStateRepository, blockRepo: IXyoOriginBlockRepository) {
    this.hasher = hasher
    this.state = new XyoOriginState(stateRepo)
    this.blockRepository = blockRepo
  }
}
