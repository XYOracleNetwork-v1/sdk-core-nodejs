import { SqlQuery } from "./query"
import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoEntitiesList } from "@xyo-network/archivist-repository"
import { IXyoPublicKey } from "@xyo-network/signing"
import { CountPublicKeyGroupsQuery } from "./publickeygroups"

// tslint:disable:prefer-array-literal

export class EntitiesQueryWithCursor extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
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
    `,
    serialization)
  }

  public async send(
    { limit, cursor }: {limit: number, cursor: string}
  ): Promise<IXyoEntitiesList> {
    type QResult = Array<{publicKey: string, hash: string, allPublicKeys: string, maxIndex: number}>
    let getEntitiesQuery: Promise<QResult> | undefined

    getEntitiesQuery = this.sql.query<QResult>(
      this.query, [cursor, limit + 1])

    const totalSizeQuery = new CountPublicKeyGroupsQuery(this.sql, this.serialization).send()

    const [entitiesResults, totalSize] = await Promise.all([getEntitiesQuery, totalSizeQuery])
    const hasNextPage = entitiesResults.length === (limit + 1)
    if (hasNextPage) {
      entitiesResults.pop()
    }

    const list = _.chain(entitiesResults)
      .map((result) => {
        return {
          firstKnownPublicKey: this.serialization
            .deserialize(result.publicKey)
            .hydrate<IXyoPublicKey>(),
          type: {
            sentinel: parseInt(result.publicKey.substr(12, 2), 16) > 128,
            archivist: parseInt(result.publicKey.substr(14, 2), 16) > 128,
            bridge: parseInt(result.publicKey.substr(16, 2), 16) > 128,
            diviner: parseInt(result.publicKey.substr(18, 2), 16) > 128
          },
          mostRecentIndex: result.maxIndex,
          allPublicKeys: _.chain(result.allPublicKeys).split(',')
            .map(str => this.serialization
              .deserialize(str.trim())
              .hydrate<IXyoPublicKey>())
            .value()
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
}
