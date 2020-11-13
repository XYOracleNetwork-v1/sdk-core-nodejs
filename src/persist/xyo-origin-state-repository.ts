import { XyoStructure } from '../object-model'
import XyoSigner from '../signing/xyo-signer'

abstract class XyoOriginStateRepository {
  abstract putIndex(index: XyoStructure): void
  abstract putPreviousHash(previousHash: XyoStructure): void
  abstract addSigner(signer: XyoSigner): void

  abstract getIndex(): XyoStructure | undefined
  abstract getPreviousHash(): XyoStructure | undefined
  abstract getSigners(): XyoSigner[]
  abstract removeOldestSigner(): void

  abstract commit(): Promise<void>
}

export default XyoOriginStateRepository
