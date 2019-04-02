import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

// This seems to update the GroupId, which is the earliest known public key for
// a PoO chain

export class RelinkPublicKeysQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      UPDATE PublicKeys SET publicKeyGroupId = ? WHERE publicKeyGroupId = ?
    `,
    serialization)
  }

  public async send(
    { publicKeyGroupIdNew,
      publicKeyGroupIdOld }: {publicKeyGroupIdNew: number,
        publicKeyGroupIdOld: number}
  ) {
    return this.sql.query(
      this.query,
      [publicKeyGroupIdNew, publicKeyGroupIdOld]
    )
  }
}
