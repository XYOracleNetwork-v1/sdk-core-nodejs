import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class DeleteOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      DELETE obp FROM OriginBlockParties obp
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE ob.signedHash = ?;
    `,
    serialization)
  }

  public async send(
    { hash }: {hash: string}
  ) {
    return this.sql.query(
      this.query,
      [hash]
    )
  }
}
