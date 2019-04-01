import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoSignature, IXyoPublicKey } from "@xyo-network/signing"

// tslint:disable:prefer-array-literal

export class DeletePublicKeyGroupQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      DELETE FROM PublicKeyGroups WHERE id = ?
    `,
    serialization)
  }

  public async send(
    { publicKeyGroupId }: {publicKeyGroupId: number}
  ) {
    return this.sql.query(
      this.query,
      [publicKeyGroupId]
    )
  }
}
