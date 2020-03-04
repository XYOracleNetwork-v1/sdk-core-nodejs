/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/member-delimiter-style */
import { IXyoSigner } from '../signing/xyo-signer'
import { XyoStructure } from '../object-model'

export interface IXyoOriginStateRepository {
  putIndex(index: XyoStructure): void
  putPreviousHash(previousHash: XyoStructure): void
  addSigner(signer: IXyoSigner): void

  getIndex(): XyoStructure | undefined
  getPreviousHash(): XyoStructure | undefined
  getSigners(): IXyoSigner[]
  removeOldestSigner(): void

  commit(): Promise<void>
}
