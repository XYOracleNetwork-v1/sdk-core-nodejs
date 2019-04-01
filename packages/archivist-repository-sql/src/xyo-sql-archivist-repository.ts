/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 1:20:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sql-archivist-repository.ts
 * @Last modified by: ryanxyo
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

import { SqlService } from './sql-service'
import { XyoBase } from '@xyo-network/base'
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoSerializationService, IXyoSerializableObject } from '@xyo-network/serialization'

import _ from 'lodash'
import { IXyoHash } from '@xyo-network/hashing'
import { IOriginBlockQueryResult } from '@xyo-network/origin-block-repository'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBridgeHashSet } from '@xyo-network/origin-chain'
import { BlocksTheProviderAttributionQuery } from './queries/originblockattributions/selectbyhash'
import { IntersectionsQuery } from './queries/intersections'
import { IntersectionsWithCursorQuery } from './queries/intersectionswithcursor'
import { EntitiesQueryWithCursor } from './queries/entitieswithcursor'
import { EntitiesQuery } from './queries/entities'
import { InsertKeySignaturesQuery } from './queries/keysignatures'
import { CreateOriginBlockPartiesQuery } from './queries/createoriginblockparties'
import { InsertPayloadItemsQuery } from './queries/payloaditems/insert'
import { UpsertPublicKeysQuery, SelectPublicKeysByKeysQuery } from './queries/publickeys'
import { InsertPublicKeyGroupQuery } from './queries/publickeygroups'
import { UpdateOriginBlockPartiesQuery, UnlinkOriginBlockPartiesQuery, DeleteOriginBlockPartiesQuery } from './queries/originblockparties'
import { SelectOriginBlocksByKeyQuery, SelectOriginBlocksByHashQuery, SelectOriginBlocksWithOffsetQuery, SelectOriginBlocksQuery } from './queries/originblocks'
import { DeletePayloadItemsQuery } from './queries/payloaditems'

export class XyoArchivistSqlRepository extends XyoBase implements IXyoArchivistRepository {

  private static qryDeletePayloadItems = `
    DELETE p FROM PayloadItems p
      JOIN OriginBlockParties obp on obp.id = p.originBlockPartyId
      JOIN OriginBlocks ob on ob.id = obp.originBlockId
    WHERE ob.signedHash = ?;
  `

  private static qryDeleteKeySignatures = `
    DELETE k FROM KeySignatures k
      JOIN OriginBlockParties obp on obp.id = k.originBlockPartyId
      JOIN OriginBlocks ob on ob.id = obp.originBlockId
    WHERE ob.signedHash = ?;
  `

  private static qryDeleteOriginBlocks = `
    DELETE ob FROM OriginBlocks ob
    WHERE ob.signedHash = ?;
  `

  private static qryDeletePublicKeys = `
    DELETE pk FROM PublicKeys pk
      LEFT JOIN OriginBlockParties obp on obp.nextPublicKeyId = pk.id
      LEFT JOIN KeySignatures ks on ks.publicKeyId = pk.id
    WHERE obp.id IS NULL AND ks.publicKeyId IS NULL;
  `

  private static qryDeletePublicKeyGroups = `
    DELETE pkg FROM PublicKeyGroups pkg
      LEFT JOIN PublicKeys pk on pk.publicKeyGroupId = pkg.id
    WHERE pk.id IS NULL;
  `

  private static qryContainsOriginBlock = `
    SELECT
    COUNT(ob.id) > 0 as containsOriginBlock
      FROM OriginBlocks ob
    WHERE ob.signedHash = ?
  `

  private static qryAllOriginBlockHashes = `
    SELECT
      signedHash
    FROM OriginBlocks;
  `

  private static qryAggrigateKeys = `
    UPDATE PublicKeys pk
      SET pk.publicKeyGroupId = ?
    WHERE pk.publicKeyGroupId IN (?)
  `

  private static qryDeleteKeys = `
    DELETE FROM PublicKeyGroups WHERE id IN (?)
  `

  private static qryInsertOriginBlocks = `
    INSERT INTO OriginBlocks(signedHash, signedBytes, bytes, bridgedFromBlock, meta)
    VALUES(?, ?, ?, ?, ?);
  `

  private static qryCreatePublicKeyGroup = `
    INSERT INTO PublicKeyGroups() VALUES()
  `

  constructor(
    private readonly sqlService: SqlService,
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
  }

  public async getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult> {
    return new SelectOriginBlocksByKeyQuery(this.sqlService, this.serializationService).send({ publicKey })
  }

  public async getIntersections(
    publicKeyA: string,
    publicKeyB: string,
    limit: number,
    cursor: string | undefined
  ): Promise<IXyoIntersectionsList> {

    if (!cursor) {
      return new IntersectionsQuery(
        this.sqlService, this.serializationService).send({ publicKeyA, publicKeyB, limit })
    }
    return new IntersectionsWithCursorQuery(
      this.sqlService, this.serializationService).send({ publicKeyA, publicKeyB, limit, cursor })
  }

  public async getEntities(limit: number, cursor?: string | undefined): Promise<IXyoEntitiesList> {
    if (!cursor) {
      return new EntitiesQuery(
        this.sqlService, this.serializationService).send({ limit })
    }
    return new EntitiesQueryWithCursor(
      this.sqlService, this.serializationService).send({ limit, cursor })
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    const hexHash = hash.toString('hex')

    await new DeletePayloadItemsQuery(this.sqlService, this.serializationService).send(
      { hash: hexHash }
    )

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteKeySignatures, [hexHash])

    await new UnlinkOriginBlockPartiesQuery(this.sqlService, this.serializationService).send(
      { hash: hexHash }
    )

    await new DeleteOriginBlockPartiesQuery(this.sqlService, this.serializationService).send(
      { hash: hexHash }
    )

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteOriginBlocks, [hexHash])

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeletePublicKeys)

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeletePublicKeyGroups)
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    const result = await this.sqlService.query<Array<{containsOriginBlock: number}>>(
      XyoArchivistSqlRepository.qryContainsOriginBlock, [hash.toString('hex')])

    return Boolean(result[0].containsOriginBlock)
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    const result = await this.sqlService.query<Array<{signedHash: string}>>(
      XyoArchivistSqlRepository.qryAllOriginBlockHashes)

    return result.map(item => Buffer.from(item.signedHash, 'hex'))
  }

  public async addOriginBlock(
    hash: IXyoHash,
    originBlock: IXyoBoundWitness,
    bridgedFromOriginBlockHash?: IXyoHash
  ): Promise<void> {
    try {
      const originBlockId = await this.tryCreateNewOriginBlock(hash, originBlock, bridgedFromOriginBlockHash)
      const publicKeySets = await this.tryCreatePublicKeys(originBlock)

      const originBlockPartyIds = await new CreateOriginBlockPartiesQuery(
        this.sqlService, this.serializationService).send({
          originBlock,
          originBlockId,
          publicKeyGroupIds: publicKeySets.map((pks: any) => pks.publicKeyGroupId)
        }
      )

      const keySignatureSets = await this.tryCreateKeySignatureSets(
        publicKeySets,
        originBlockPartyIds,
        originBlock
      )

      const payloadItemsIds = await this.tryCreatePayloadItems(originBlock, originBlockPartyIds)

      await originBlockPartyIds.reduce(async (promiseChain, originBlockPartyId) => {
        await promiseChain
        return this.linkPreviousInsertOriginBlockParties(originBlockPartyId)
      }, Promise.resolve() as Promise<void>)

      await originBlock.parties.reduce(async (promiseChain, blockParty) => {
        await promiseChain
        const bridgeHashSetCandidate = blockParty.heuristics.find(h => h.schemaObjectId === schema.bridgeHashSet.id)
        if (bridgeHashSetCandidate === undefined) {
          return
        }

        const bridgeHashSet = bridgeHashSetCandidate as XyoBridgeHashSet
        const values = bridgeHashSet.hashSet.map(
          h => `('${hash.serializeHex()}', ${blockParty.partyIndex}, '${h.serializeHex()}' )`
        )
        if (values.length === 0) {
          return
        }

        const valuesQuery = values.join(',\n')
        await this.sqlService.query(`
          INSERT INTO OriginBlockAttributions (
            sourceSignedHash,
            originBlockPartyIndex,
            providesAttributionForSignedHash
          ) VALUES ${valuesQuery};
        `, [])
      }, Promise.resolve())

      const idHierarchy = {
        originBlockId,
        originBlockPartyIds,
        publicKeyGroupIds: publicKeySets.map(pks => pks.publicKeyGroupId),
        publicKeys: publicKeySets.map(pks => pks.publicKeyIds.join(', ')),
        keySignatureSets: keySignatureSets.map(keySignatureArray => keySignatureArray.join(', ')),
        payloadItemsIds: payloadItemsIds.map(payloadItemArray => payloadItemArray.join(', ')),
      }

      this.logInfo(
        `Successfully created an origin block with component parts:\n${XyoBase.stringify(idHierarchy)}`
      )
    } catch (err) {
      this.logError(`Failed to add an origin block`, err)
      throw err
    }
  }

  public async getOriginBlockByHash(hash: Buffer): Promise<IXyoBoundWitness | undefined> {
    return new SelectOriginBlocksByHashQuery(this.sqlService, this.serializationService).send({ hash })
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: IXyoBoundWitness}> {
    return new BlocksTheProviderAttributionQuery(this.sqlService, this.serializationService).send({ hash })
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<IOriginBlockQueryResult> {

    if (offsetHash) {
      return new SelectOriginBlocksWithOffsetQuery(
        this.sqlService, this.serializationService).send({ limit, offsetHash })
    }
    return new SelectOriginBlocksQuery(this.sqlService, this.serializationService).send({ limit })
  }

  private async tryCreatePublicKeys(originBlock: IXyoBoundWitness) {
    try {
      const result = await originBlock.publicKeys.reduce(async (promiseChain, publicKeySet) => {
        const aggregator = await promiseChain
        const pkSet = await this.tryCreatePublicKeyset(publicKeySet.keys)
        aggregator.push(pkSet)
        return aggregator
      }, Promise.resolve([]) as Promise<Array<{publicKeyGroupId: number, publicKeyIds: number[]}>>)

      const allPublicKeyIds = _.chain(result).map('publicKeyIds').flatten().join(', ').value()
      const allPublicKeyGroupIds = _.chain(result).map('publicKeyGroupId').join(', ').value()
      this.logInfo(`Succeeded in creating public keys with ids ${allPublicKeyIds}`)
      this.logInfo(`Succeeded in creating public key group with ids ${allPublicKeyGroupIds}`)
      return result
    } catch (err) {
      this.logError(`Failed to create Public Keys`, err)
      throw err
    }
  }

  private async tryCreatePublicKeyset(
    publicKeySet: IXyoPublicKey[]
  ): Promise<{publicKeyGroupId: number, publicKeyIds: number[]}> {
    try {
      const pks = _.chain(publicKeySet).map(key => key.serializeHex()).value()
      const existingKeys = await new SelectPublicKeysByKeysQuery(this.sqlService, this.serializationService).send(pks)

      if (existingKeys.length === 0) {
        const publicKeyGroupId = await this.createNewPublicKeyGroup()
        const publicKeyIds = await publicKeySet.reduce(async (idCollectionPromise, key) => {
          const ids = await idCollectionPromise
          const newId = await new UpsertPublicKeysQuery(this.sqlService, this.serializationService).send(
            {
              key,
              publicKeyGroupId
            }
          )

          ids.push(newId)
          return ids
        }, Promise.resolve([]) as Promise<number[]>)

        return {
          publicKeyGroupId,
          publicKeyIds
        }
      }

      const keysGroupedByPublicKeyGroupId = _.chain(existingKeys).groupBy('publicKeyGroupId').value()
      const allKeysBelongToSamePublicKeyGroup = Object.keys(keysGroupedByPublicKeyGroupId).length === 1
      const allKeysExist = existingKeys.length === pks.length

      const aggregateMismatchedPublicKeyGroups = async () => {
        const sortedKeys = _.chain(keysGroupedByPublicKeyGroupId).keys().sortBy().value()
        const firstKey = _.chain(sortedKeys).first().parseInt(10).value()
        const otherKeys = _.chain(sortedKeys).drop(1).map(sk => parseInt(sk, 10)).value()
        await this.sqlService.query(XyoArchivistSqlRepository.qryAggrigateKeys, [firstKey, otherKeys])
        await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteKeys, [otherKeys])
        return firstKey
      }

      const addNewKeysToExistingPublicKeyGroup = async (
        keysGroupedByPublicKeyGroup: {[s: string]: Array<{ id: number; key: string; publicKeyGroupId: number}>}
      ) => {
        const keysThatNeedToBeCreated = _.difference(
          pks,
          _.chain(keysGroupedByPublicKeyGroup).values().first().map('key').value()
        )

        const publicKeyGroupId = _.chain(keysGroupedByPublicKeyGroup).keys().first().parseInt(10).value()
        const newlyCreatedPublicKeyIds = await _.reduce(
          keysThatNeedToBeCreated,
          async (promiseChain, keyThatNeedToBeCreated) => {
            const ids = await promiseChain
            const newId = await new UpsertPublicKeysQuery(this.sqlService, this.serializationService).send(
              {
                publicKeyGroupId,
                key: keyThatNeedToBeCreated
              }
            )
            ids.push(newId)
            return ids
          }, Promise.resolve([]) as Promise<number[]>
        )

        return {
          publicKeyGroupId,
          publicKeyIds: [
            ...(_.chain(keysGroupedByPublicKeyGroupId).values().first().map('id').value() as number[]),
            ...newlyCreatedPublicKeyIds
          ]
        }
      }

      if (allKeysExist && allKeysBelongToSamePublicKeyGroup) {
        return {
          publicKeyGroupId: _.chain(keysGroupedByPublicKeyGroupId).keys().first().parseInt(10).value(),
          publicKeyIds: _.chain(existingKeys).map('id').value() as number[]
        }
      }

      if (allKeysExist && !allKeysBelongToSamePublicKeyGroup) {
        const firstKey = await aggregateMismatchedPublicKeyGroups()
        return {
          publicKeyGroupId: firstKey,
          publicKeyIds: _.chain(existingKeys).map('id').value() as number[]
        }
      }

      if (!allKeysExist && allKeysBelongToSamePublicKeyGroup) {
        return addNewKeysToExistingPublicKeyGroup(keysGroupedByPublicKeyGroupId)
      }

      if (!allKeysExist && !allKeysBelongToSamePublicKeyGroup) {
        const firstKey = await aggregateMismatchedPublicKeyGroups()
        const arrayValue = _.chain(keysGroupedByPublicKeyGroupId).values().flatten().value()
        const newKeysGroupedByPublicKeyGroupId = {
          [firstKey]: arrayValue
        }

        return addNewKeysToExistingPublicKeyGroup(newKeysGroupedByPublicKeyGroupId)
      }

      throw new Error(`This should never get here exception`)

    } catch (err) {
      this.logError(`Failed to create Public Keys`, err)
      throw err
    }
  }

  private async tryCreateNewOriginBlock(
    hash: IXyoHash,
    originBlock: IXyoBoundWitness,
    bridgedFromOriginBlockHash?: IXyoHash
  ): Promise<number> {
    try {
      const id = (await this.sqlService.query<{insertId: number}>(
        XyoArchivistSqlRepository.qryInsertOriginBlocks, [
          hash.serializeHex(),
          originBlock.getSigningData(),
          originBlock.serialize(),
          (
            bridgedFromOriginBlockHash &&
            bridgedFromOriginBlockHash.serializeHex()) || null,
          JSON.stringify(originBlock.getReadableValue(), null, 2)
        ]
      )).insertId

      this.logInfo(`Created new origin block with id ${id}`)
      return id
    } catch (err) {
      this.logError(`Failed to create new origin block`, err)
      throw err
    }
  }

  private async createNewPublicKeyGroup(): Promise<number> {
    return new InsertPublicKeyGroupQuery(this.sqlService, this.serializationService).send()
  }

  private async createPayloadItems(originBlockPartyId: number, payload: IXyoSerializableObject[], isSigned: boolean) {
    return payload.reduce(
      this.createPayloadItemReducer(originBlockPartyId, isSigned),
      Promise.resolve([]) as Promise<number[]>
    )
  }

  private createPayloadItemReducer(originBlockPartyId: number, isSigned: boolean) {
    return async (promiseChain: Promise<number[]>, payloadItem: IXyoSerializableObject, currentIndex: number) => {
      const ids = await promiseChain
      const newId = await new InsertPayloadItemsQuery(this.sqlService, this.serializationService).send(
        {
          originBlockPartyId,
          isSigned,
          payloadItem,
          currentIndex
        }
      )
      ids.push(newId)
      return ids
    }
  }

  private async tryCreateKeySignatureSets(
    publicKeySets: IPublicKeySetGroup[],
    originBlockParties: number[],
    originBlock: IXyoBoundWitness
  ): Promise<number[][]> {
    try {
      const ids = await publicKeySets.reduce(async (promiseChain, publicKeySet, currentIndex) => {
        const collections = await promiseChain
        const newIds = await new InsertKeySignaturesQuery(this.sqlService, this.serializationService).send(
          { publicKeyIds: publicKeySet.publicKeyIds,
            originBlockPartyId: originBlockParties[currentIndex],
            signatures: originBlock.signatures[currentIndex].signatures }
        )
        collections.push(newIds)
        return collections
      }, Promise.resolve([]) as Promise<number[][]>)

      this.logInfo(`Successfully create key signature sets with ids ${_.flatten(ids).join(', ')}`)
      return ids
    } catch (err) {
      this.logError(`Failed to create key signature sets`, err)
      throw err
    }
  }

  private async tryCreatePayloadItems(
    originBlock: IXyoBoundWitness,
    originBlockParties: number[]
  ) {
    try {
      const result = await [...originBlock.heuristics, ...originBlock.metadata]
      .reduce(async (promiseChain, payload, currentIndex) => {
        const ids = await promiseChain
        const payloadItemIds = await this.createPayloadItems(
          originBlockParties[currentIndex % originBlockParties.length],
          payload,
          currentIndex < originBlock.heuristics.length
        )
        ids.push(payloadItemIds)
        return ids
      }, Promise.resolve([]) as Promise<number[][]>)

      const allIds = _.chain(result).flatten().join(', ').value()
      this.logInfo(`Succeeded in creating PayloadItems with ids ${allIds}`)
      return result
    } catch (err) {
      this.logError(`Failed to create PayloadItems`, err)
      throw err
    }
  }

  private async linkPreviousInsertOriginBlockParties(originBlockPartyId: number) {
    await new UpdateOriginBlockPartiesQuery(this.sqlService, this.serializationService).send(
      { originBlockPartyId }
    )
  }
}

interface IPublicKeySetGroup {
  publicKeyGroupId: number
  publicKeyIds: number[]
}
