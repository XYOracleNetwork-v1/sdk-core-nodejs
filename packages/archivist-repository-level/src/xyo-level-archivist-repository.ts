/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 1:20:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-neo4j-archivist-repository.ts
 * @Last modified by: arietrouw
 * @Last modified time: Wednesday, 6th February 2019 10:04:16 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:prefer-array-literal

import {
  IXyoArchivistRepository,
  IXyoOriginBlocksByPublicKeyResult,
  IXyoEntitiesList,
  IXyoIntersectionsList
} from '@xyo-network/archivist-repository'

import { XyoBase } from '@xyo-network/base'
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoSerializationService, IXyoSerializableObject } from '@xyo-network/serialization'

import _ from 'lodash'
import { IXyoHash } from '@xyo-network/hashing'
import { IOriginBlockQueryResult } from '@xyo-network/origin-block-repository'

import levelup, { LevelUp } from 'levelup'
import leveldown from 'leveldown'
import { AbstractIteratorOptions } from 'abstract-leveldown'

export class XyoArchivistLevelRepository extends XyoBase implements IXyoArchivistRepository {

  private db: LevelUp

  constructor(
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
    this.db = levelup(leveldown('./xyo-blocks'))
  }

  public async getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult> {
    return {
      publicKeys: [],
      boundWitnesses: []
    }
  }

  public async getIntersections(
    publicKeyA: string,
    publicKeyB: string,
    limit: number,
    cursor: string | undefined
  ): Promise<IXyoIntersectionsList> {
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
  }

  public async getEntities(limit: number, offsetCursor?: string | undefined): Promise<IXyoEntitiesList> {
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    return
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    return false
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    return []
  }

  public async addOriginBlock(
    hash: IXyoHash,
    originBlock: IXyoBoundWitness,
    bridgedFromOriginBlockHash?: IXyoHash
  ): Promise<void> {
    return this.db.put(hash.getData(), originBlock.srcBuffer)
  }

  public async getOriginBlockByHash(hash: Buffer): Promise<IXyoBoundWitness | undefined> {
    return this.db.get(hash)
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: IXyoBoundWitness}> {
    return {

    }
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<IOriginBlockQueryResult> {
    const options: AbstractIteratorOptions = {
      limit
    }

    if (offsetHash) {
      options.gt = offsetHash
    }

    const blocks: IXyoBoundWitness[] = []

    await this.db.createReadStream(options
      ).on('data', (data) => {
        blocks.push(data.value)
      }).on('error', (err) => {
        throw(err)
      }).on('close', () => {
        console.log('Stream closed')
      }).on('end', () => {
        console.log('Stream ended')
      })
    return {
      list: [],
      hasNextPage: (blocks.length === limit),
      totalSize: -1
    }
  }
}
