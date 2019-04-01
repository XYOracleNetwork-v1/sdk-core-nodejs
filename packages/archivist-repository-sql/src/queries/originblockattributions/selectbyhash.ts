import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

// tslint:disable:prefer-array-literal

export class BlocksTheProviderAttributionQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        ob.bytes as bytes,
        ob.signedHash as originBlockHash
      FROM OriginBlockAttributions oba
        JOIN OriginBlocks ob on ob.signedHash = oba.sourceSignedHash
      WHERE oba.providesAttributionForSignedHash = ?;
    `,
    serialization)
  }

  public async send({ hash }: {hash: Buffer}): Promise<any> {
    const results = await this.sql.query<Array<{bytes: Buffer, originBlockHash: string}>>(
      this.query, [hash.toString('hex')])

    return results.reduce((memo: {[h: string]: IXyoBoundWitness}, result) => {
      memo[result.originBlockHash] = this.serialization.deserialize(result.bytes).hydrate()
      return memo
    }, {})
  }
}
