import { XyoStructure } from '@xyo-network/object-model'
import { IXyoSigner } from '../signing/xyo-signer'

export interface IXyoOriginStateRepository {
  putIndex (index: XyoStructure): void
  putPreviousHash (previousHash: XyoStructure): void
  addSigner (signer: IXyoSigner): void

  getIndex (): XyoStructure | undefined
  getPreviousHash (): XyoStructure | undefined
  getSigners (): IXyoSigner[]

  removeOldestSigner (): void

  commit (): Promise<void>
}
