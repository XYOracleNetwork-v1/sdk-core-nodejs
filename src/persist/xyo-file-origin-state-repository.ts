import { IXyoOriginStateRepository } from './xyo-origin-state-repository'
import { IXyoSigner } from '../signing/xyo-signer'
import fs from 'fs'
import { XyoStructure, XyoBuffer } from '../object-model'

interface IXyoFileOriginState {
  index: string | undefined
  previousHash: string | undefined
  signers: string[]
}

export class XyoFileOriginStateRepository implements IXyoOriginStateRepository {
  private indexCache: XyoStructure | undefined
  private previousHashCache: XyoStructure | undefined
  private signersCache: IXyoSigner[] = []
  private statePath: string

  constructor(statePath: string) {
    this.statePath = statePath
  }

  public addSigner(signer: IXyoSigner) {
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

  public getSigners(): IXyoSigner[] {
    if (this.signersCache) {
      return this.signersCache
    }

    return []
  }

  public commit(): Promise<void> {
    const state = this.getCurrentFileState()

    return new Promise((resolve, reject) => {
      fs.writeFile(this.statePath, JSON.stringify(state), 'utf8', (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  public async restore(signerFromPrivateKey: (buffer: Buffer) => IXyoSigner): Promise<void> {
    const currentState = await this.readCurrentFileState()

    if (currentState) {
      if (currentState.index) {
        this.indexCache = new XyoStructure(new XyoBuffer(Buffer.from(currentState.index, 'base64')))
      }

      if (currentState.previousHash) {
        this.previousHashCache = new XyoStructure(new XyoBuffer(Buffer.from(currentState.previousHash, 'base64')))
      }

      currentState.signers.forEach((privateKey) => {
        this.signersCache.push(signerFromPrivateKey(Buffer.from(privateKey, 'base64')))
      })
    }
  }

  private readCurrentFileState(): Promise<IXyoFileOriginState | undefined> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.statePath, (error, data) => {
        if (error) {
          resolve(undefined)
          return
        }

        const stringValue = data.toString('utf8')
        resolve(JSON.parse(stringValue) as IXyoFileOriginState)
      })
    })
  }

  private getCurrentFileState(): IXyoFileOriginState {
    const signersString: string[] = []
    let previousHashString: string | undefined
    let indexString: string | undefined

    if (this.previousHashCache) {
      previousHashString = this.previousHashCache.getAll().getContentsCopy().toString('base64')
    }

    if (this.indexCache) {
      indexString = this.indexCache.getAll().getContentsCopy().toString('base64')
    }

    this.signersCache.forEach((signer) => {
      signersString.push(signer.getPrivateKey().getAll().getContentsCopy().toString('base64'))
    })

    const state: IXyoFileOriginState = {
      index: indexString,
      previousHash: previousHashString,
      signers: signersString
    }

    return state
  }
}
