import { SqlQuery } from "./query"
import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import _ from 'lodash'
import { schema } from '@xyo-network/serialization-schema'
import { XyoNextPublicKey, XyoIndex, XyoPreviousHash } from '@xyo-network/origin-chain'
import { SelectAllOriginBlockPartyIdsQuery, InsertOriginBlockPartiesQuery, SelectPreviousOriginBlockPartiesQuery } from "./originblockparties"
import { UpsertPublicKeysQuery } from "./publickeys"

// tslint:disable:prefer-array-literal

export class CreateOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, ``, // this is a meta query, so no sql
    serialization)
  }

  public async send(
    {originBlock,
      originBlockId,
      publicKeyGroupIds}:
    {originBlock: IXyoBoundWitness,
      originBlockId: number,
      publicKeyGroupIds: number[]}): Promise<number[]> {
    try {
      const result = await originBlock.heuristics.reduce(async (promiseChain, payload, currentIndex: number) => {
        const ids = await promiseChain
        const blockIndex = payload.find(item => item.schemaObjectId === schema.index.id) as XyoIndex
        const bridgeHashSet = payload.find(
          item => item.schemaObjectId === schema.bridgeHashSet.id
        )

        const nextPublicKey = payload.find(item => item.schemaObjectId === schema.nextPublicKey.id)

        let nextPublicKeyId: number | undefined
        if (nextPublicKey) {
          nextPublicKeyId = await new UpsertPublicKeysQuery(this.sql, this.serialization).send(
            {
              key: (nextPublicKey as XyoNextPublicKey).publicKey,
              publicKeyGroupId: publicKeyGroupIds[currentIndex]
            }
          )
        }

        const previousOriginBlock = payload.find(
          item => item.schemaObjectId === schema.previousHash.id
        ) as XyoPreviousHash | undefined

        const previousOriginBlockHash = previousOriginBlock && previousOriginBlock.hash.serializeHex()

        const publicKeys = originBlock.publicKeys[currentIndex].keys.map(pk => pk.serializeHex())

        const previousOriginBlockPartyId = await new SelectPreviousOriginBlockPartiesQuery(
          this.sql, this.serialization).send(
          { publicKeys,
            blockIndex: blockIndex.number - 1,
            previousHash: previousOriginBlockHash }
          )

        await new SelectAllOriginBlockPartyIdsQuery(this.sql, this.serialization).send()

        const insertId = await new InsertOriginBlockPartiesQuery(this.sql, this.serialization).send(
          {
            originBlockId,
            nextPublicKeyId,
            previousOriginBlockHash,
            previousOriginBlockPartyId,
            positionalIndex: currentIndex,
            blockIndex: blockIndex.number,
            bridgeHashSet: bridgeHashSet && bridgeHashSet.serializeHex(),
            payloadBytes: Buffer.concat(payload.reduce((collection, item) => {
              const s = item.serialize()
              collection.push(s)
              return collection
            }, [] as Buffer[]))
          }
        )

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
}
