import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class InsertOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO OriginBlockParties (
        originBlockId,
        positionalIndex,
        blockIndex,
        bridgeHashSet,
        payloadBytes,
        nextPublicKeyId,
        previousOriginBlockHash,
        previousOriginBlockPartyId
      )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?);
    `,
    serialization)
  }

  public async send(
    { originBlockId,
      positionalIndex,
      blockIndex,
      bridgeHashSet,
      payloadBytes,
      nextPublicKeyId,
      previousOriginBlockHash,
      previousOriginBlockPartyId }:
      { originBlockId: number,
        positionalIndex: number,
        blockIndex: number,
        bridgeHashSet: string | undefined,
        payloadBytes: Buffer,
        nextPublicKeyId: number | undefined,
        previousOriginBlockHash: string | undefined,
        previousOriginBlockPartyId: number | undefined }
  ) {
    return (await this.sql.query<{insertId: number}>(
      this.query,
      [originBlockId,
        positionalIndex,
        blockIndex,
        bridgeHashSet,
        payloadBytes,
        nextPublicKeyId,
        previousOriginBlockHash,
        previousOriginBlockPartyId]
    )).insertId
  }
}
