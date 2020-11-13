import { XyoStructure } from '../object-model'
import XyoOriginStateRepository from '../persist/xyo-origin-state-repository'
import XyoSigner from '../signing/xyo-signer'

export class XyoRamOriginStateRepository implements XyoOriginStateRepository {
  private indexCache: XyoStructure | undefined
  private previousHashCache: XyoStructure | undefined
  private signersCache: XyoSigner[] = []

  public addSigner(signer: XyoSigner) {
    this.signersCache.push(signer)
  }

  public removeOldestSigner() {
    if (this.signersCache.length > 0) {
      this.signersCache.shift()
    }
  }

  public putIndex(index: XyoStructure): void {
    this.indexCache = index
  }

  public putPreviousHash(previousHash: XyoStructure): void {
    this.previousHashCache = previousHash
  }

  public getIndex(): XyoStructure | undefined {
    return this.indexCache
  }

  public getPreviousHash(): XyoStructure | undefined {
    return this.previousHashCache
  }

  public getSigners(): XyoSigner[] {
    if (this.signersCache) {
      return this.signersCache
    }

    return []
  }

  // eslint-disable-next-line require-await
  public async commit() {
    return
  }
}
