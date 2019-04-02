import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import _ from 'lodash'
import { CountOriginBlocksQuery } from "./count"

// tslint:disable:prefer-array-literal

export class SelectOriginBlocksQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        ob.bytes as bytes
      FROM OriginBlocks ob
      ORDER BY ob.id
      LIMIT ?
    `,
    serialization)
  }

  public async send({ limit }: {limit: number}): Promise<any> {
    const originBlockQuery = this.sql.query<Array<{bytes: Buffer}>>(
      this.query, [limit + 1])

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
