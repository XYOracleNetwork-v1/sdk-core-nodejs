import { IXyoHash } from '@xyo-network/hashing'
import { IXyoBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoSigner } from '@xyo-network/signing'

export interface IBlockPermissionRequestResolver {
  requestPermissionForBlock(
    hash: IXyoHash,
    signers: IXyoSigner[],
    payload: IXyoPayload,
    timeout: number
  ): Promise<IRequestPermissionForBlockResult | undefined>
}

export interface IRequestPermissionForBlockResult {
  newBoundWitnessHash: IXyoHash
  partyIndex: number
  supportingData: {[hash: string]: IXyoBoundWitness}
}
