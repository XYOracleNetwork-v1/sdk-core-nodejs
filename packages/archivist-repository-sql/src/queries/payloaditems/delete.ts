import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService, IXyoSerializableObject } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class DeletePayloadItemsQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      DELETE p FROM PayloadItems p
        JOIN OriginBlockParties obp on obp.id = p.originBlockPartyId
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE ob.signedHash = ?;
    `,
    serialization)
  }

  public async send(
    { hash }:
    { hash: string }
  ) {
    return this.sql.query(
      this.query, [
        hash,
      ])
  }
}
