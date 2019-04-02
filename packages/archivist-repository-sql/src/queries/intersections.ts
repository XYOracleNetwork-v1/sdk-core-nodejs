import { SqlQuery } from "./query"
import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoIntersectionsList } from "@xyo-network/archivist-repository"
import { OriginChainBlockCountQuery } from "./originchainblockcount"

// tslint:disable:prefer-array-literal

export class IntersectionsQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        ob1.signedHash as signedHash,
        obp1.blockIndex as blockIndex
      FROM PublicKeys pk1
        JOIN PublicKeys pk1Others on pk1.publicKeyGroupId = pk1Others.publicKeyGroupId
        JOIN KeySignatures ks1 on ks1.publicKeyId = pk1Others.id
        JOIN OriginBlockParties obp1 on obp1.id = ks1.originBlockPartyId
        JOIN OriginBlockParties obp2 on obp2.originBlockId = obp1.originBlockId AND obp2.id != obp1.id
        JOIN KeySignatures ks2 on ks2.originBlockPartyId = obp2.id
        JOIN PublicKeys pk2 on pk2.id = ks2.publicKeyId
        JOIN PublicKeys pk2Others on pk2.publicKeyGroupId = pk2Others.publicKeyGroupId
        JOIN OriginBlocks ob1 on ob1.id = obp1.originBlockId
      WHERE pk1.key = ? AND pk2Others.key = ?
      ORDER BY obp1.blockIndex
      LIMIT ?
    `,
    serialization)
  }

  public async send(
    { publicKeyA,
      publicKeyB,
      limit}: {publicKeyA: string,
        publicKeyB: string,
        limit: number}
  ): Promise<IXyoIntersectionsList> {
    type QResult = Array<{signedHash: string, blockIndex: number}>
    let getIntersectionsQuery: Promise<QResult>

    getIntersectionsQuery = this.sql.query<QResult>(
      this.query, [publicKeyA, publicKeyB, limit + 1])

    const totalSizeQuery = new OriginChainBlockCountQuery(this.sql, this.serialization).send({ publicKeyA, publicKeyB })

    const [intersectionResults, totalSize] = await Promise.all([getIntersectionsQuery, totalSizeQuery])
    const hasNextPage = intersectionResults.length === (limit + 1)
    if (hasNextPage) {
      intersectionResults.pop()
    }

    const list = _.chain(intersectionResults)
      .map(result => result.signedHash)
      .value()

    const cursorId = _.chain(intersectionResults).last().get('blockIndex').value() as number | undefined
    return {
      list,
      hasNextPage,
      totalSize,
      cursor: cursorId ? String(cursorId) : undefined
    }
  }
}
