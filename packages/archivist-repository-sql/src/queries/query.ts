import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { XyoBase } from "@xyo-network/base"

export class SqlQuery extends XyoBase {

  protected sql: SqlService
  protected query: string
  protected serialization: IXyoSerializationService

  constructor(sql: SqlService, query: string, serialization: IXyoSerializationService) {
    super()
    this.sql = sql
    this.query = query
    this.serialization = serialization
  }

  public async send(params: any): Promise<any> {
    return false
  }
}
