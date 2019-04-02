import { SqlQuery } from "./query"
import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoPublicKey } from "@xyo-network/signing"

// tslint:disable:prefer-array-literal

export class OriginChainBlockCountQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
    SELECT
      COUNT(ob1.id) as totalSize
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
    `,
    serialization)
  }

  public async send(
    { publicKeyA, publicKeyB }: {publicKeyA: string, publicKeyB: string}): Promise<number> {
    return _.chain(
      await this.sql.query<Array<{totalSize: number}>>(this.query, [publicKeyA, publicKeyB])
    ).first().get('totalSize').value() as number
  }
}
