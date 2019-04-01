import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import _ from 'lodash'
import { CountOriginBlocksQuery } from "./count"

// tslint:disable:prefer-array-literal

export class SelectOriginBlocksWithOffsetQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        ob.bytes as bytes
      FROM OriginBlocks ob
        JOIN OriginBlocks ob2 on ob2.signedHash = ?
      WHERE ob.id > ob2.id
      ORDER BY ob.id
      LIMIT ?
    `,
    serialization)
  }

  public async send({ limit, offsetHash }: {limit: number, offsetHash: Buffer}): Promise<any> {
    const originBlockQuery = this.sql.query<Array<{bytes: Buffer}>>(
      this.query, [offsetHash.toString('hex'), limit + 1])

    const [originBlockResults, totalSize] =
      await Promise.all([originBlockQuery, new CountOriginBlocksQuery(this.sql, this.serialization).send()])

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
