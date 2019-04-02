import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class SelectPublicKeysByKeysQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        pk.id as id,
        pk.key as \`key\`,
        pk.publicKeyGroupId as publicKeyGroupId
      FROM PublicKeys pk
      WHERE pk.key in (?)
    `,
    serialization)
  }

  public async send(pks: string[]): Promise<Array<{id: number, key: string, publicKeyGroupId: number}>> {
    return this.sql.query<Array<{id: number, key: string, publicKeyGroupId: number}>>(
      this.query, [pks])
  }
}
