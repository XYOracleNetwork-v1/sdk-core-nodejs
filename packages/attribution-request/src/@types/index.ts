import { IXyoHash } from '@xyo-network/hashing'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

export interface IBlockPermissionRequestResolver {
  requestPermissionForBlock(hash: IXyoHash): Promise<IRequestPermissionForBlockResult | undefined>
}

export interface IRequestPermissionForBlockResult {
  newBoundWitnessHash: IXyoHash
  partyIndex: number
  supportingData: {[hash: string]: IXyoBoundWitness}
}
