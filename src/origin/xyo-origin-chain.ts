import { IXyoHasher } from '../hashing'
import { XyoOriginState } from './xyo-origin-state'
import { IXyoOriginBlockRepository } from '../persist/xyo-origin-block-repository'
import { IXyoOriginStateRepository } from '../persist/xyo-origin-state-repository'
import { XyoBoundWitness } from '../bound-witness'
import { throwStatement } from '@babel/types'

export class XyoOriginChain {
  private hasher: IXyoHasher
  private state: XyoOriginState
  private blockRepository: IXyoOriginBlockRepository

  constructor(hasher: IXyoHasher, stateRepo: IXyoOriginStateRepository, blockRepo: IXyoOriginBlockRepository) {
    this.hasher = hasher
    this.state = new XyoOriginState(stateRepo)
    this.blockRepository = blockRepo
  }

  public async onBoundWitnessCompleted (boundWitness: XyoBoundWitness) {
    const hash = boundWitness.getHash(this.hasher)
    this.state.addOriginBlock(hash)

    await this.state.repo.commit()
    await this.blockRepository.addOriginBlock(hash.getContents().getContentsCopy(), boundWitness.getContents().getContentsCopy())
  }
}
