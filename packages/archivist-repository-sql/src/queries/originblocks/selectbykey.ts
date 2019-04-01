import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import _ from 'lodash'
import { IXyoPublicKey } from "@xyo-network/signing"

// tslint:disable:prefer-array-literal

export class SelectOriginBlocksByKeyQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
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
    `,
    serialization)
  }

  public async send({ publicKey }: {publicKey: IXyoPublicKey}):
    Promise<{ publicKeys: IXyoPublicKey[]; boundWitnesses: IXyoBoundWitness[]; }> {

    const results = await this.sql.query<Array<{publicKeysForBlock: string, originBlockBytes: Buffer}>>(
        this.query, [publicKey.serializeHex()]
      )

    const reducer: {
      publicKeys: {
        [s: string]: IXyoPublicKey
      },
      originBlocks: IXyoBoundWitness[]
    } = { publicKeys: {}, originBlocks: [] }

    const reducedValue = _.reduce(results, (memo, result) => {
      const boundWitness = this.serialization
        .deserialize(Buffer.from(result.originBlockBytes))
        .hydrate<IXyoBoundWitness>()

      _.chain(result.publicKeysForBlock).split(',').map(str => str.trim()).each((pk) => {
        if (!memo.publicKeys.hasOwnProperty(pk)) {
          memo.publicKeys[pk] =
              this.serialization.deserialize(
                Buffer.from(pk, 'hex')
              ).hydrate<IXyoPublicKey>()
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
}
