import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class SelectPreviousOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
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
    `,
    serialization)
  }

  public async send({ blockIndex, previousHash, publicKeys }:
    {blockIndex: number, previousHash: string | undefined, publicKeys: string[]}): Promise<number | undefined> {
    let previousOriginBlockPartyId: number | undefined

    const previousOriginBlockPartyIds = await this.sql.query<Array<{id: number}>>(
      this.query, [
        blockIndex - 1,
        previousHash,
        publicKeys,
        publicKeys,
      ])

    if (previousOriginBlockPartyIds.length) {
      previousOriginBlockPartyId = _.chain(previousOriginBlockPartyIds).first().get('id').value()
    }
    return previousOriginBlockPartyId
  }
}
