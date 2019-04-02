import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class CountOriginBlocksQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        COUNT(ob.id) as totalSize
      FROM OriginBlocks ob;
    `,
    serialization)
  }

  public async send(): Promise<number> {
    return _.chain(
      await this.sql.query<Array<{totalSize: number}>>(this.query)
    ).first().get('totalSize').value() as number
  }
}
