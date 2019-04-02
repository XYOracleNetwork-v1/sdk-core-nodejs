import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoSignature, IXyoPublicKey } from "@xyo-network/signing"

// tslint:disable:prefer-array-literal

export class InsertPublicKeyGroupQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO PublicKeyGroups() VALUES()
    `,
    serialization)
  }

  public async send(
  ) {
    return (await this.sql.query<{insertId: number}>(this.query)).insertId
  }
}
