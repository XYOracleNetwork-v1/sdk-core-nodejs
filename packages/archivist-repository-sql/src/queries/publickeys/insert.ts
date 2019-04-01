import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class InsertPublicKeysQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO PublicKeys(\`key\`, publicKeyGroupId)
      VALUES(?, ?)
    `,
    serialization)
  }

  public async send(
    { hexKey, publicKeyGroupId }: { hexKey: string, publicKeyGroupId: number }
  ) {
    return (await this.sql.query<{insertId: number}>(
      this.query,
      [hexKey, publicKeyGroupId]
    )).insertId
  }
}
