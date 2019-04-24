import { IXyoOriginStateRepository } from './xyo-origin-state-repository'
import { XyoStructure, XyoBuffer } from '@xyo-network/object-model'
import { IXyoSigner } from '../signing/xyo-signer'
import fs from 'fs'

interface IXyoFileOriginState {
  index: string | undefined
  previousHash: string | undefined
}

export class XyoFileOriginStateRepository implements IXyoOriginStateRepository {
  private indexCache: XyoStructure | undefined
  private previousHashCache: XyoStructure | undefined
  private signersCache: IXyoSigner[] = []
  private statePath: string

  constructor (statePath: string) {
    this.statePath = statePath
  }

  public addSigner (signer: IXyoSigner) {
    this.signersCache.push(signer)
  }

  public removeOldestSigner () {
    if (this.signersCache.length > 0) {
      this.signersCache.shift()
    }
  }

  public putIndex (index: XyoStructure): void {
    this.indexCache = index
  }

  public putPreviousHash (previousHash: XyoStructure): void {
    this.previousHashCache = previousHash
  }

  public getIndex (): XyoStructure | undefined {
    return this.indexCache
  }

  public getPreviousHash (): XyoStructure | undefined {
    return this.previousHashCache
  }

  public getSigners (): IXyoSigner[] {
    if (this.signersCache) {
      return this.signersCache
    }

    return []
  }

  public commit (): Promise<void> {
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

  public async restore (): Promise<void> {
    const currentState = await this.readCurrentFileState()

    if (currentState) {
      if (currentState.index) {
        this.indexCache = new XyoStructure(XyoBuffer.wrapBuffer(Buffer.from(currentState.index, 'base64')))
      }

      if (currentState.previousHash) {
        this.previousHashCache = new XyoStructure(XyoBuffer.wrapBuffer(Buffer.from(currentState.previousHash, 'base64')))
      }
    }
  }

  private readCurrentFileState (): Promise<IXyoFileOriginState | undefined> {
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

  private getCurrentFileState (): IXyoFileOriginState {
    let previousHashString: string | undefined
    let indexString: string | undefined

    if (this.previousHashCache) {
      previousHashString = this.previousHashCache.getContents().getContentsCopy().toString('base64')
    }

    if (this.indexCache) {
      indexString = this.indexCache.getContents().getContentsCopy().toString('base64')
    }

    const state: IXyoFileOriginState = {
      index: indexString,
      previousHash: previousHashString
    }

    return state
  }
}