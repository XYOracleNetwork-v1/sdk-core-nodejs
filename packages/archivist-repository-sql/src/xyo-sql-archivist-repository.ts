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
import { XyoNextPublicKey, XyoIndex, XyoPreviousHash, XyoBridgeHashSet } from '@xyo-network/origin-chain'
import { OriginBlockByHashQuery } from './queries/originblock-by-hash'
import { BlocksTheProviderAttributionQuery } from './queries/blocks-that-provider-attribution'
import { OriginBlocksWithOffsetQuery } from './queries/originblocks-offset'
import { OriginBlocksQuery } from './queries/originblocks'
import { ExistingKeysQuery } from './queries/existing-keys'
import { OriginBlocksByPublicKeyQuery } from './queries/originblocks-by-publickey'
import { IntersectionsQuery } from './queries/intersections'
import { IntersectionsWithCursorQuery } from './queries/intersections-with-cursor'
import { EntitiesQueryWithCursor } from './queries/entities-with-cursor'
import { EntitiesQuery } from './queries/entities'

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

  private static qryDeleteBlockParties = `
    UPDATE OriginBlockParties obp2
      JOIN OriginBlockParties obp on obp.id = obp2.previousOriginBlockPartyId
      JOIN OriginBlocks ob on ob.id = obp.originBlockId
      SET obp2.previousOriginBlockPartyId = NULL
    WHERE ob.signedHash = ?;
  `

  private static qryDeleteBlockParties2 = `
    DELETE obp FROM OriginBlockParties obp
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

  private static qryPublicKeyGroupsByKey = `
    SELECT id, publicKeyGroupId FROM PublicKeys WHERE \`key\` = ? LIMIT 1
  `

  private static qryUpdatePublicKeys = `
    UPDATE PublicKeys SET publicKeyGroupId = ? WHERE publicKeyGroupId = ?
  `

  private static qryInsertPublicKeys = `
    INSERT INTO PublicKeys(\`key\`, publicKeyGroupId)
    VALUES(?, ?)
  `

  private static qryDeletePublicKeyGroup = `
    DELETE FROM PublicKeyGroups WHERE id = ?
  `

  private static qryPreviousOriginBlockParties = `
    SELECT
      obp.id as id
      FROM OriginBlockParties obp
      JOIN OriginBlocks ob on ob.id = obp.originBlockId
      LEFT JOIN KeySignatures k on k.originBlockPartyId = obp.id
      LEFT JOIN PublicKeys pk on pk.id = k.publicKeyId
      LEFT JOIN PublicKeys npk on npk.id = obp.nextPublicKeyId
      WHERE obp.blockIndex = ? AND
      ob.signedHash = ? AND
      (
        pk.key IN (?) OR npk.key IN (?)
      )
    GROUP BY obp.id
    LIMIT 1;
  `

  private static qryAllBlockPartyIds = `
    SELECT
      obp.id
    FROM OriginBlockParties obp
  `

  private static qryInsertBlockParties = `
    INSERT INTO OriginBlockParties (
      originBlockId,
      positionalIndex,
      blockIndex,
      bridgeHashSet,
      payloadBytes,
      nextPublicKeyId,
      previousOriginBlockHash,
      previousOriginBlockPartyId
    )
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?);
  `

  private static qryInsertKeySignatures = `
    INSERT INTO KeySignatures(
      publicKeyId,
      originBlockPartyId,
      signature,
      positionalIndex
    )
    VALUES(?, ?, ?, ?)
  `

  private static qryInsertPayloadItems = `
    INSERT INTO PayloadItems(
      originBlockPartyId,
      isSigned,
      schemaObjectId,
      bytes,
      positionalIndex
    )
    VALUES(?, ?, ?, ?, ?)
    `

  private static qryUpdateBlockParties = `
    UPDATE OriginBlockParties
    SET previousOriginBlockPartyId = ?
    WHERE id IN (
      SELECT
        id
      FROM (
        SELECT
          obp2.id as id
        FROM OriginBlockParties obp2
          JOIN (
            SELECT
              obp.id as originBlockId,
              ob.signedHash as signedHash,
              k.publicKeyId as publicKeyId,
              obp.nextPublicKeyId as nextPublicKeyId
            FROM OriginBlockParties obp
              JOIN OriginBlocks ob on ob.id = obp.originBlockId
              JOIN KeySignatures k on k.originBlockPartyId = obp.id
            WHERE obp.id = ?
          ) as other on other.signedHash = obp2.previousOriginBlockHash
          LEFT JOIN KeySignatures k2 on k2.originBlockPartyId = obp2.id
        WHERE other.nextPublicKeyId = k2.publicKeyId OR other.publicKeyId = k2.publicKeyId
        GROUP BY obp2.id
      ) as OriginBlockPartyIdsToUpdate
    );
  `

  constructor(
    private readonly sqlService: SqlService,
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
  }

  public async getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult> {
    return new OriginBlocksByPublicKeyQuery(this.sqlService, this.serializationService).send({ publicKey })
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

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeletePayloadItems, [hexHash])

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteKeySignatures, [hexHash])

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteBlockParties, [hexHash])

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteBlockParties2, [hexHash])

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

      const originBlockPartyIds = await this.tryCreateOriginBlockParties(
        originBlock,
        originBlockId,
        publicKeySets.map(pks => pks.publicKeyGroupId)
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
    return new OriginBlockByHashQuery(this.sqlService, this.serializationService).send({ hash })
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: IXyoBoundWitness}> {
    return new BlocksTheProviderAttributionQuery(this.sqlService, this.serializationService).send({ hash })
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<IOriginBlockQueryResult> {

    if (offsetHash) {
      return new OriginBlocksWithOffsetQuery(this.sqlService, this.serializationService).send({ limit, offsetHash })
    }
    return new OriginBlocksQuery(this.sqlService, this.serializationService).send({ limit })
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
      const pks = _.chain(publicKeySet).map(pk => pk.serializeHex()).value()
      const existingKeys = await new ExistingKeysQuery(this.sqlService, this.serializationService).send(pks)

      if (existingKeys.length === 0) {
        const publicKeyGroupId = await this.createNewPublicKeyGroup()
        const publicKeyIds = await publicKeySet.reduce(async (idCollectionPromise, pk) => {
          const ids = await idCollectionPromise
          const newId = await this.getUpdateOrCreatePublicKey(pk, publicKeyGroupId)
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
            const newId = await this.getUpdateOrCreatePublicKey(keyThatNeedToBeCreated, publicKeyGroupId)
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
    return (await this.sqlService.query<{insertId: number}>(XyoArchivistSqlRepository.qryCreatePublicKeyGroup)).insertId
  }

  private async getUpdateOrCreatePublicKey(
    key: IXyoPublicKey | string,
    publicKeyGroupId: number
  ): Promise<number> {
    const hexKey = typeof key === 'string' ? key : key.serializeHex()

    const publicKeyMatches = (await this.sqlService.query<Array<{id: number, publicKeyGroupId: number}>>(
      XyoArchivistSqlRepository.qryPublicKeyGroupsByKey, [hexKey]))

    const publicKey = _.chain(publicKeyMatches).first().value()
    if (publicKey) {
      if (publicKey.publicKeyGroupId === publicKeyGroupId) {
        return publicKey.id
      }
      // Self heal out of turn blocks
      await this.sqlService.query(
        XyoArchivistSqlRepository.qryUpdatePublicKeys,
        [publicKeyGroupId, publicKey.publicKeyGroupId]
      )

      await this.sqlService.query(XyoArchivistSqlRepository.qryDeletePublicKeyGroup, [publicKey.publicKeyGroupId])

      return publicKey.id
    }

    return (await this.sqlService.query<{insertId: number}>(
      XyoArchivistSqlRepository.qryInsertPublicKeys, [hexKey, publicKeyGroupId])).insertId
  }

  private async tryCreateOriginBlockParties(
    boundWitness: IXyoBoundWitness,
    originBlockId: number,
    publicKeyGroupIds: number[]
  ) {
    try {
      const result = await boundWitness.heuristics.reduce(async (promiseChain, payload, currentIndex: number) => {
        const ids = await promiseChain
        const blockIndex = payload.find(item => item.schemaObjectId === schema.index.id) as XyoIndex
        const bridgeHashSet = payload.find(
          item => item.schemaObjectId === schema.bridgeHashSet.id
        )

        const nextPublicKey = payload.find(item => item.schemaObjectId === schema.nextPublicKey.id)

        let nextPublicKeyId: number | undefined
        if (nextPublicKey) {
          nextPublicKeyId = await this.getUpdateOrCreatePublicKey(
            (nextPublicKey as XyoNextPublicKey).publicKey,
            publicKeyGroupIds[currentIndex]
            )
        }

        const previousOriginBlock = payload.find(
          item => item.schemaObjectId === schema.previousHash.id
        ) as XyoPreviousHash | undefined

        const previousOriginBlockHash = previousOriginBlock && previousOriginBlock.hash.serializeHex()

        const publicKeys = boundWitness.publicKeys[currentIndex].keys.map(pk => pk.serializeHex())

        let previousOriginBlockPartyId: number | undefined

        const previousOriginBlockPartyIds = await this.sqlService.query<Array<{id: number}>>(
          XyoArchivistSqlRepository.qryPreviousOriginBlockParties, [
            blockIndex.number - 1,
            previousOriginBlockHash,
            publicKeys,
            publicKeys,
          ])

        if (previousOriginBlockPartyIds.length) {
          previousOriginBlockPartyId = _.chain(previousOriginBlockPartyIds).first().get('id').value()
        }

        await this.sqlService.query(XyoArchivistSqlRepository.qryAllBlockPartyIds)

        const insertId = (await this.sqlService.query<{insertId: number}>(
          XyoArchivistSqlRepository.qryInsertBlockParties, [
          originBlockId,
          currentIndex,
          blockIndex.number,
          bridgeHashSet && bridgeHashSet.serializeHex(),
          Buffer.concat(payload.reduce((collection, item) => {
            const s = item.serialize()
            collection.push(s)
            return collection
          }, [] as Buffer[])),
          nextPublicKeyId,
          previousOriginBlockHash,
          previousOriginBlockPartyId
        ])).insertId

        ids.push(insertId)
        return ids
      }, Promise.resolve([]) as Promise<number[]>)

      this.logInfo(`Succeeded in creating origin block parties with ids ${result.join(', ')}`)
      return result
    } catch (err) {
      this.logError(`Failed to create origin block parties`, err)
      throw err
    }
  }

  private async createKeySignatures(
    publicKeyIds: number[],
    originBlockPartyId: number,
    signatures: IXyoSignature[]
  ) {
    return publicKeyIds.reduce(async (promiseChain, publicKeyId, currentIndex) => {
      const ids = await promiseChain
      const insertId = (await this.sqlService.query<{insertId: number}>(
        XyoArchivistSqlRepository.qryInsertKeySignatures, [
        publicKeyId,
        originBlockPartyId,
        this.serializationService.serialize(signatures[currentIndex], 'hex') as string,
        currentIndex
      ])).insertId
      ids.push(insertId)
      return ids
    }, Promise.resolve([]) as Promise<number[]>)
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
      const newId = (await this.sqlService.query<{insertId: number}>(
        XyoArchivistSqlRepository.qryInsertPayloadItems, [
        originBlockPartyId,
        isSigned,
        payloadItem.schemaObjectId,
        payloadItem.serializeHex(),
        currentIndex
      ])).insertId
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
        const newIds = await this.createKeySignatures(
          publicKeySet.publicKeyIds,
          originBlockParties[currentIndex],
          originBlock.signatures[currentIndex].signatures
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
    const result = await this.sqlService.query(
      XyoArchivistSqlRepository.qryUpdateBlockParties, [originBlockPartyId, originBlockPartyId])
    return
  }
}

interface IPublicKeySetGroup {
  publicKeyGroupId: number
  publicKeyIds: number[]
}
