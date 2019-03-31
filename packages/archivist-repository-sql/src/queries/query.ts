import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"

export class SqlQuery {

  protected sql: SqlService
  protected query: string
  protected serialization: IXyoSerializationService

  constructor(sql: SqlService, query: string, serialization: IXyoSerializationService) {
    this.sql = sql
    this.query = query
    this.serialization = serialization
  }

  public async send(params: any): Promise<any> {
    return false
  }
}
