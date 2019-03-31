import { SqlQuery } from "./query"
import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoBoundWitness } from "../../../bound-witness/dist"
import _ from 'lodash'
import { OriginBlockCount } from "./originblockcount"

// tslint:disable:prefer-array-literal

export class OriginBlockByHashQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT ob.bytes as bytes
      FROM OriginBlocks ob
      WHERE signedHash = ?
      LIMIT 1;
    `,
    serialization)
  }

  public async send({ limit, offsetHash }: {limit: number, offsetHash?: Buffer | undefined}): Promise<any> {
    let originBlockQuery: Promise<Array<{bytes: Buffer}>> | undefined

    originBlockQuery = this.sql.query<Array<{bytes: Buffer}>>(
      this.query, [limit + 1])

    const [originBlockResults, totalSize] =
      await Promise.all([originBlockQuery, new OriginBlockCount(this.sql, this.serialization).send()])

    const hasNextPage = originBlockResults.length === (limit + 1)

    if (hasNextPage) {
      originBlockResults.pop()
    }

    const list = _.chain(originBlockResults)
      .map(result => this.serialization
            .deserialize(Buffer.from(result.bytes))
            .hydrate<IXyoBoundWitness>()
      )
      .value()

    return {
      list,
      hasNextPage,
      totalSize
    }
  }
}
