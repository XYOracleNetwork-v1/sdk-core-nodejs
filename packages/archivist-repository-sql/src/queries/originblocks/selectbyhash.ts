import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class SelectOriginBlocksByHashQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT ob.bytes as bytes
      FROM OriginBlocks ob
      WHERE signedHash = ?
      LIMIT 1;
    `,
    serialization)
  }

  public async send({ hash }: {hash: Buffer}): Promise<any> {
    const result = await this.sql.query<Array<{bytes: Buffer}>>(
      this.query, [hash.toString('hex')])

    return _.chain(result)
      .map(item => this.serialization.deserialize(item.bytes).hydrate<IXyoBoundWitness>())
      .first()
      .value()
  }
}
