import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class SelectPublicKeyGroupsByKeyQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT id, publicKeyGroupId FROM PublicKeys WHERE \`key\` = ? LIMIT 1
    `,
    serialization)
  }

  public async send({ hexKey }: {hexKey: string}): Promise<Array<{id: number, publicKeyGroupId: number}>> {
    return this.sql.query<Array<{id: number, publicKeyGroupId: number}>>(
      this.query, [hexKey])
  }
}
