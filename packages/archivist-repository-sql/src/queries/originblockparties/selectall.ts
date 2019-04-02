import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class SelectAllOriginBlockPartyIdsQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        obp.id
      FROM OriginBlockParties obp
      `,
    serialization)
  }

  public async send(): Promise<string[]> {
    return this.sql.query(this.query)
  }
}
