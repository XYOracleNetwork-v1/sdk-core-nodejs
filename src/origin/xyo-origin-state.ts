import { IXyoOriginStateRepository } from '../persist/xyo-origin-state-repository'
import { IXyoSigner } from '../signing/xyo-signer'
import { XyoStructure, XyoIterableStructure, XyoBuffer } from '../object-model'
import { XyoObjectSchema } from '../schema'

export class XyoOriginState {

  public static createNextPublicKey(publicKey: XyoStructure): XyoStructure {
    return XyoStructure.newInstance(XyoObjectSchema.NEXT_PUBLIC_KEY, publicKey.getAll())
  }

  public static createPreviousHash(hash: XyoStructure): XyoStructure {
    return XyoIterableStructure.newIterable(XyoObjectSchema.PREVIOUS_HASH, [hash])
  }

  public static createIndex(index: number): XyoStructure {
    const numberBuffer = Buffer.alloc(4)
    numberBuffer.writeUInt32BE(index, 0)
    return XyoStructure.newInstance(XyoObjectSchema.INDEX, new XyoBuffer(numberBuffer))
  }

  public repo: IXyoOriginStateRepository
  private waitingSigners: IXyoSigner[] = []
  private nextPublicKey: XyoStructure | undefined

  constructor(repo: IXyoOriginStateRepository) {
    this.repo = repo
  }

  public getIndexAsNumber(): number {
    return this.getIndex().getValue().getContentsCopy().readUInt32BE(0)
  }

  public getNextPublicKey(): XyoStructure | undefined {
    return this.nextPublicKey
  }

  public getIndex(): XyoStructure {
    const indexInStore = this.repo.getIndex()

    if (indexInStore) {
      return indexInStore
    }

    return XyoOriginState.createIndex(0)
  }

  public getPreviousHash(): XyoStructure | undefined {
    return this.repo.getPreviousHash()
  }

  public removeOldestSigner() {
    this.repo.removeOldestSigner()
  }

  public getSigners() {
    return this.repo.getSigners()
  }

  public addSigner(signer: IXyoSigner) {
    const index = this.getIndex().getValue().getContentsCopy().readUInt32BE(0)

    if (index === 0) {
      this.repo.addSigner(signer)
      return
    }

    this.waitingSigners.push(signer)
    this.nextPublicKey = XyoOriginState.createNextPublicKey(signer.getPublicKey())
  }

  public addOriginBlock(hash: XyoStructure) {
    const previousHash = XyoOriginState.createPreviousHash(hash)
    this.nextPublicKey = undefined
    this.addWaitingSigner()
    this.repo.putPreviousHash(previousHash)
    this.incrementIndex()
  }

  private addWaitingSigner() {
    if (this.waitingSigners.length > 0) {
      this.repo.addSigner(this.waitingSigners[0])
      this.waitingSigners.shift()
    }
  }

  private incrementIndex() {
    const index = this.getIndex().getValue().getContentsCopy().readUInt32BE(0)
    const newIndex = XyoOriginState.createIndex(index + 1)
    this.repo.putIndex(newIndex)
  }

}
