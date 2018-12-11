/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 1:20:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sql-archivist-repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th December 2018 6:12:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:prefer-array-literal

import {
  IXyoArchivistRepository,
  IXyoOriginBlocksByPublicKeyResult,
  IXyoEntitiesList
} from '@xyo-network/archivist-repository'

import { SqlService } from './sql-service'
import { XyoBase } from '@xyo-network/base'
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoSerializationService, IXyoSerializableObject } from '@xyo-network/serialization'

import _ from 'lodash'
import { IXyoHash } from '@xyo-network/hashing'
import { IOriginBlockQueryResult } from '@xyo-network/origin-block-repository'

export class XyoArchivistSqlRepository extends XyoBase implements IXyoArchivistRepository {

  constructor(
    private readonly sqlService: SqlService,
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
  }

  public async getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult> {
    const results = await this.sqlService.query<Array<{publicKeysForBlock: string, originBlockBytes: Buffer}>>(`
      SELECT
        CONCAT(pk2.key) as publicKeysForBlock,
        ob.bytes as originBlockBytes
      FROM PublicKeys pk
        JOIN PublicKeys pk2 on pk.publicKeyGroupId = pk2.publicKeyGroupId
        JOIN KeySignatures k on k.publicKeyId = pk2.id
        JOIN OriginBlockParties obp on obp.id = k.originBlockPartyId
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE pk.key = ?
      GROUP BY ob.id
      ORDER BY obp.blockIndex;
    `, [this.serializationService.serialize(publicKey, 'hex') as string])

    const reducer: {
      publicKeys: {
        [s: string]: IXyoPublicKey
      },
      originBlocks: IXyoBoundWitness[]
    } = { publicKeys: {}, originBlocks: [] }

    const reducedValue = _.reduce(results, (memo, result) => {
      const boundWitness = this.serializationService
        .deserialize(Buffer.from(result.originBlockBytes))
        .hydrate<IXyoBoundWitness>()

      _.chain(result.publicKeysForBlock).split(',').map(str => str.trim()).each((pk) => {
        if (!memo.publicKeys.hasOwnProperty(pk)) {
          memo.publicKeys[pk] = this.serializationService.deserialize(Buffer.from(pk, 'hex')).hydrate<IXyoPublicKey>()
        }
      }).value()

      memo.originBlocks.push(boundWitness as IXyoBoundWitness)
      return memo
    }, reducer)

    return {
      publicKeys: _.chain(reducedValue.publicKeys).values().value(),
      boundWitnesses: reducedValue.originBlocks
    }
  }

  public async getEntities(limit: number, offsetCursor?: string | undefined): Promise<IXyoEntitiesList> {
    let getEntitiesQuery: Promise<Array<{publicKey: string, hash: string}>> | undefined

    if (!offsetCursor) {
      getEntitiesQuery = this.sqlService.query<Array<{publicKey: string, hash: string}>>(`
        SELECT
          entities.publicKeyGroupId as publicKeyGroupId,
          obp1.blockIndex as minIndex,
          obp2.blockIndex as maxIndex,
          pk1.key as publicKey,
          pk2.key as mostRecentKey,
          entities.allPublicKeys as allPublicKeys,
          entities.publicKeyGroupId as hash
        FROM
          (
            SELECT
              pkg.id as publicKeyGroupId,
              MIN(obp.blockIndex) as minBlockIndex,
              MAX(obp.blockIndex) as maxBlockIndex,
              COUNT(DISTINCT obp.id) as numberOfBlocks,
              GROUP_CONCAT(DISTINCT pk.key) as allPublicKeys
            FROM PublicKeyGroups pkg
              JOIN PublicKeys pk on pk.publicKeyGroupId = pkg.id
              JOIN KeySignatures ks on ks.publicKeyId = pk.id
              JOIN OriginBlockParties obp on obp.id = ks.originBlockPartyId
            GROUP BY pkg.id
            LIMIT ?
          ) as entities

          JOIN PublicKeys pk1 on pk1.publicKeyGroupId = entities.publicKeyGroupId
          JOIN KeySignatures ks1 on ks1.publicKeyId = pk1.id
          JOIN OriginBlockParties obp1 on obp1.id = ks1.originBlockPartyId AND obp1.blockIndex = entities.minBlockIndex
          JOIN PublicKeys pk2 on pk2.publicKeyGroupId = entities.publicKeyGroupId
          JOIN KeySignatures ks2 on ks2.publicKeyId = pk2.id
          JOIN OriginBlockParties obp2 on obp2.id = ks2.originBlockPartyId AND obp2.blockIndex = entities.maxBlockIndex
        GROUP BY entities.publicKeyGroupId
        ORDER BY entities.publicKeyGroupId;
      `, [limit + 1])
    } else {
      getEntitiesQuery = this.sqlService.query<Array<{publicKey: string, hash: string}>>(`
        SELECT
          entities.publicKeyGroupId as publicKeyGroupId,
          obp1.blockIndex as minIndex,
          obp2.blockIndex as maxIndex,
          pk1.key as publicKey,
          pk2.key as mostRecentKey,
          entities.allPublicKeys as allPublicKeys,
          entities.publicKeyGroupId as hash
        FROM
          (
            SELECT
              pkg.id as publicKeyGroupId,
              MIN(obp.blockIndex) as minBlockIndex,
              MAX(obp.blockIndex) as maxBlockIndex,
              COUNT(DISTINCT obp.id) as numberOfBlocks,
              GROUP_CONCAT(DISTINCT pk.key) as allPublicKeys
            FROM PublicKeyGroups pkg
              JOIN PublicKeys pk on pk.publicKeyGroupId = pkg.id
              JOIN KeySignatures ks on ks.publicKeyId = pk.id
              JOIN OriginBlockParties obp on obp.id = ks.originBlockPartyId
            WHERE pkg.id > ?
            GROUP BY pkg.id
            LIMIT ?
          ) as entities

          JOIN PublicKeys pk1 on pk1.publicKeyGroupId = entities.publicKeyGroupId
          JOIN KeySignatures ks1 on ks1.publicKeyId = pk1.id
          JOIN OriginBlockParties obp1 on obp1.id = ks1.originBlockPartyId AND obp1.blockIndex = entities.minBlockIndex
          JOIN PublicKeys pk2 on pk2.publicKeyGroupId = entities.publicKeyGroupId
          JOIN KeySignatures ks2 on ks2.publicKeyId = pk2.id
          JOIN OriginBlockParties obp2 on obp2.id = ks2.originBlockPartyId AND obp2.blockIndex = entities.maxBlockIndex
        GROUP BY entities.publicKeyGroupId
        ORDER BY entities.publicKeyGroupId;
      `, [offsetCursor, limit + 1])
    }

    const totalSizeQuery = this.sqlService.query<Array<{totalSize: number}>>(`
      SELECT
        COUNT(pkg.id) as totalSize
      FROM PublicKeyGroups pkg;
    `)

    const [entitiesResults, totalSizeResults] = await Promise.all([getEntitiesQuery, totalSizeQuery])
    const totalSize = _.chain(totalSizeResults).first().get('totalSize').value() as number
    const hasNextPage = entitiesResults.length === (limit + 1)
    if (hasNextPage) {
      entitiesResults.pop()
    }

    const list = _.chain(entitiesResults)
      .map((result) => {
        return {
          firstKnownPublicKey: this.serializationService.deserialize(result.publicKey).hydrate<IXyoPublicKey>(),
          type: {
            sentinel: parseInt(result.publicKey.substr(12, 2), 16) > 128,
            archivist: parseInt(result.publicKey.substr(14, 2), 16) > 128,
            bridge: parseInt(result.publicKey.substr(16, 2), 16) > 128,
            diviner: parseInt(result.publicKey.substr(18, 2), 16) > 128
          },
        }
      })
      .value()

    const cursorId = _.chain(entitiesResults).last().get('hash').value() as number | undefined
    return {
      list,
      hasNextPage,
      totalSize,
      cursor: cursorId ? String(cursorId) : undefined
    }
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    const hexHash = hash.toString('hex')

    await this.sqlService.query(`
      DELETE p FROM PayloadItems p
        JOIN OriginBlockParties obp on obp.id = p.originBlockPartyId
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE ob.signedHash = ?;
    `, [hexHash])

    await this.sqlService.query(`
      DELETE k FROM KeySignatures k
        JOIN OriginBlockParties obp on obp.id = k.originBlockPartyId
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE ob.signedHash = ?;
    `, [hexHash])

    await this.sqlService.query(`
      UPDATE OriginBlockParties obp2
        JOIN OriginBlockParties obp on obp.id = obp2.previousOriginBlockPartyId
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
        SET obp2.previousOriginBlockPartyId = NULL
      WHERE ob.signedHash = ?;
    `, [hexHash])

    await this.sqlService.query(`
      DELETE obp FROM OriginBlockParties obp
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE ob.signedHash = ?;
    `, [hexHash])

    await this.sqlService.query(`
      DELETE ob FROM OriginBlocks ob
      WHERE ob.signedHash = ?;
    `, [hexHash])

    await this.sqlService.query(`
      DELETE pk FROM PublicKeys pk
        LEFT JOIN OriginBlockParties obp on obp.nextPublicKeyId = pk.id
        LEFT JOIN KeySignatures ks on ks.publicKeyId = pk.id
      WHERE obp.id IS NULL AND ks.publicKeyId IS NULL;
    `)

    await this.sqlService.query(`
      DELETE pkg FROM PublicKeyGroups pkg
        LEFT JOIN PublicKeys pk on pk.publicKeyGroupId = pkg.id
      WHERE pk.id IS NULL;
    `)
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    const result = await this.sqlService.query<Array<{containsOriginBlock: number}>>(`
      SELECT
        COUNT(ob.id) > 0 as containsOriginBlock
      FROM OriginBlocks ob
      WHERE ob.signedHash = ?
    `, [hash.toString('hex')])

    return Boolean(result[0].containsOriginBlock)
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    const result = await this.sqlService.query<Array<{signedHash: string}>>(`
      SELECT
        signedHash
      FROM OriginBlocks;
    `)

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
    const result = await this.sqlService.query<Array<{bytes: Buffer}>>(`
      SELECT
        ob.bytes as bytes
      FROM OriginBlocks ob
      WHERE signedHash = ?
      LIMIT 1;
    `, [hash.toString('hex')])

    throw new Error('TODO')

    // return _.chain(result)
    //   .map(item => this.serializationService.deserialize<IXyoBoundWitness>(item.bytes))
    //   .first()
    //   .value()
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<IOriginBlockQueryResult> {
    let originBlockQuery: Promise<Array<{bytes: Buffer}>> | undefined

    if (!offsetHash) {
      originBlockQuery = this.sqlService.query<Array<{bytes: Buffer}>>(`
        SELECT
          ob.bytes as bytes
        FROM OriginBlocks ob
        ORDER BY ob.id
        LIMIT ?
      `, [limit + 1])
    } else {
      originBlockQuery = this.sqlService.query<Array<{bytes: Buffer}>>(`
        SELECT
          ob.bytes as bytes
        FROM OriginBlocks ob
          JOIN OriginBlocks ob2 on ob2.signedHash = ?
        WHERE ob.id > ob2.id
        ORDER BY ob.id
        LIMIT ?
      `, [offsetHash.toString('hex'), limit + 1])
    }

    const totalSizeQuery = this.sqlService.query<Array<{totalSize: number}>>(`
      SELECT
        COUNT(ob.id) as totalSize
      FROM OriginBlocks ob;
    `)

    const [originBlockResults, totalSizeResults] = await Promise.all([originBlockQuery, totalSizeQuery])
    const totalSize = _.chain(totalSizeResults).first().get('totalSize').value() as number
    const hasNextPage = originBlockResults.length === (limit + 1)
    if (hasNextPage) {
      originBlockResults.pop()
    }
    const list = _.chain(originBlockResults)
      .map(result => this.serializationService.deserialize(Buffer.from(result.bytes)).hydrate<IXyoBoundWitness>())
      .value()

    throw new Error('TODO')
    // return {
    //   list,
    //   hasNextPage,
    //   totalSize
    // }
  }

  private async tryCreatePublicKeys(originBlock: IXyoBoundWitness) {
    try {
      const result = await originBlock.publicKeys.reduce(async (promiseChain, publicKeySet) => {
        const aggregator = await promiseChain
        const pkSet = await this.tryCreatePublicKeyset(publicKeySet)
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
      const pks = _.chain(publicKeySet).map(pk => this.serializationService.serialize(pk, 'hex') as string).value()
      const existingKeys = await this.sqlService.query<Array<{id: number, key: string, publicKeyGroupId: number}>>(`
        SELECT
          pk.id as id,
          pk.key as \`key\`,
          pk.publicKeyGroupId as publicKeyGroupId
        FROM PublicKeys pk
        WHERE pk.key in (?)
      `, [pks])

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
        await this.sqlService.query(`
          UPDATE PublicKeys pk
            SET pk.publicKeyGroupId = ?
          WHERE pk.publicKeyGroupId IN (?)
        `, [firstKey, otherKeys])
        await this.sqlService.query(`DELETE FROM PublicKeyGroups WHERE id IN (?)`, [otherKeys])
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
      const id = (await this.sqlService.query<{insertId: number}>(`
        INSERT INTO OriginBlocks(signedHash, signedBytes, bytes, bridgedFromBlock, meta)
        VALUES(?, ?, ?, ?, ?);
      `, [
        this.serializationService.serialize(hash, 'hex') as string,
        originBlock.getSigningData(),
        this.serializationService.serialize(originBlock, 'hex') as string,
        (
          bridgedFromOriginBlockHash &&
          this.serializationService.serialize(bridgedFromOriginBlockHash, 'hex') as string) || null,
        '' // TODO get meta data
      ])).insertId

      this.logInfo(`Created new origin block with id ${id}`)
      return id
    } catch (err) {
      this.logError(`Failed to create new origin block`, err)
      throw err
    }
  }

  private async createNewPublicKeyGroup(): Promise<number> {
    return (await this.sqlService.query<{insertId: number}>(`INSERT INTO PublicKeyGroups() VALUES()`)).insertId
  }

  private async getUpdateOrCreatePublicKey(
    key: IXyoPublicKey | string,
    publicKeyGroupId: number
  ): Promise<number> {
    const hexKey = typeof key === 'string' ? key : this.serializationService.serialize(key, 'hex') as string

    const publicKeyMatches = (await this.sqlService.query<Array<{id: number, publicKeyGroupId: number}>>(`
      SELECT id, publicKeyGroupId FROM PublicKeys WHERE \`key\` = ? LIMIT 1
    `, [hexKey]))

    const publicKey = _.chain(publicKeyMatches).first().value()
    if (publicKey) {
      if (publicKey.publicKeyGroupId === publicKeyGroupId) {
        return publicKey.id
      }
      // Self heal out of turn blocks
      await this.sqlService.query(
        `UPDATE PublicKeys SET publicKeyGroupId = ? WHERE publicKeyGroupId = ?`,
        [publicKeyGroupId, publicKey.publicKeyGroupId]
      )

      await this.sqlService.query(`DELETE FROM PublicKeyGroups WHERE id = ?`, [publicKey.publicKeyGroupId])

      return publicKey.id
    }

    return (await this.sqlService.query<{insertId: number}>(`
      INSERT INTO PublicKeys(\`key\`, publicKeyGroupId)
      VALUES(?, ?)
    `, [hexKey, publicKeyGroupId])).insertId
  }

  private async tryCreateOriginBlockParties(
    boundWitness: IXyoBoundWitness,
    originBlockId: number,
    publicKeyGroupIds: number[]
  ) {
    try {
      const result = await boundWitness.payloads.reduce(async (promiseChain, payload, currentIndex: number) => {
        const ids = await promiseChain
        const blockIndex = payload.getIndex()
        const bridgeHashSet = payload.getBridgeHashSet()
        const nextPublicKey = payload.getNextPublicKey()

        let nextPublicKeyId: number | undefined
        if (nextPublicKey) {
          nextPublicKeyId = await this.getUpdateOrCreatePublicKey(
            nextPublicKey,
            publicKeyGroupIds[currentIndex]
            )
        }

        const previousOriginBlock = payload.getPreviousHash()
        const previousOriginBlockHash = previousOriginBlock &&
          this.serializationService.serialize(previousOriginBlock, 'hex') as string

        const publicKeys = boundWitness.publicKeys[currentIndex].map(
          pk => this.serializationService.serialize(pk, 'hex') as string
        )
        let previousOriginBlockPartyId: number | undefined

        const previousOriginBlockPartyIds = await this.sqlService.query<Array<{id: number}>>(`
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
        `, [
          blockIndex! - 1,
          previousOriginBlockHash,
          publicKeys,
          publicKeys,
        ])

        if (previousOriginBlockPartyIds.length) {
          previousOriginBlockPartyId = _.chain(previousOriginBlockPartyIds).first().get('id').value()
        }

        await this.sqlService.query(`
          SELECT
            obp.id
          FROM OriginBlockParties obp
        `)

        const insertId = (await this.sqlService.query<{insertId: number}>(`
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
        `, [
          originBlockId,
          currentIndex,
          blockIndex!,
          bridgeHashSet && this.serializationService.serialize(bridgeHashSet),
          this.serializationService.serialize(payload, 'buffer') as Buffer,
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
      const insertId = (await this.sqlService.query<{insertId: number}>(`
        INSERT INTO KeySignatures(
          publicKeyId,
          originBlockPartyId,
          signature,
          positionalIndex
        )
        VALUES(?, ?, ?, ?)
      `, [
        publicKeyId,
        originBlockPartyId,
        this.serializationService.serialize(signatures[currentIndex], 'hex') as string,
        currentIndex
      ])).insertId
      ids.push(insertId)
      return ids
    }, Promise.resolve([]) as Promise<number[]>)
  }

  private async createPayloadItems(originBlockPartyId: number, payload: IXyoPayload) {
    const signedPayloadIds = await payload.signedPayload.reduce(
      this.createPayloadItemReducer(originBlockPartyId, true),
      Promise.resolve([]) as Promise<number[]>
    )

    const unsignedPayloadIds = await payload.unsignedPayload.reduce(
      this.createPayloadItemReducer(originBlockPartyId, false),
      Promise.resolve([]) as Promise<number[]>
    )

    return [
      ...signedPayloadIds,
      ...unsignedPayloadIds
    ]
  }

  private createPayloadItemReducer(originBlockPartyId: number, isSigned: boolean) {
    return async (promiseChain: Promise<number[]>, payloadItem: IXyoSerializableObject, currentIndex: number) => {
      const ids = await promiseChain
      const newId = (await this.sqlService.query<{insertId: number}>(`
        INSERT INTO PayloadItems(
          originBlockPartyId,
          isSigned,
          schemaObjectId,
          bytes,
          positionalIndex
        )
        VALUES(?, ?, ?, ?, ?, ?)
      `, [
        originBlockPartyId,
        isSigned,
        payloadItem.schemaObjectId,
        this.serializationService.serialize(payloadItem, 'hex') as string,
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
          originBlock.signatures[currentIndex]
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
      const result = await originBlock.payloads.reduce(async (promiseChain, payload, currentIndex) => {
        const ids = await promiseChain
        const payloadItemIds = await this.createPayloadItems(
          originBlockParties[currentIndex],
          payload
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
    const result = await this.sqlService.query(`
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
    `, [originBlockPartyId, originBlockPartyId])

    return
  }
}

interface IPublicKeySetGroup {
  publicKeyGroupId: number
  publicKeyIds: number[]
}
