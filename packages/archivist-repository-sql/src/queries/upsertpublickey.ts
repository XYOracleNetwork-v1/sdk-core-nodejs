import { SqlQuery } from "./query"
import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoPublicKey } from "@xyo-network/signing"
import { UpdatePublicKeysQuery } from "./updatepublickeys"
import { InsertPublicKeysQuery } from "./insertpublickeys"
import { SelectPublicKeyGroupsByIdQuery, DeletePublicKeyGroupQuery } from "./publickeygroups"

// tslint:disable:prefer-array-literal

export class UpsertPublicKeyQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, ``, // this is a meta query, so no sql
    serialization)
  }

  public async send(
    { key,
      publicKeyGroupId }: {
        key: IXyoPublicKey | string,
        publicKeyGroupId: number}
  ) {
    const hexKey = typeof key === 'string' ? key : key.serializeHex()

    const publicKeyMatches = await new SelectPublicKeyGroupsByIdQuery(this.sql, this.serialization).send(
      { hexKey }
    )

    const publicKey = _.chain(publicKeyMatches).first().value()
    if (publicKey) {
      if (publicKey.publicKeyGroupId === publicKeyGroupId) {
        return publicKey.id
      }

      // Self heal out of turn blocks
      await new UpdatePublicKeysQuery(this.sql, this.serialization).send(
        { publicKeyGroupIdNew: publicKeyGroupId,
          publicKeyGroupIdOld: publicKey.publicKeyGroupId
        }
      )

      await new DeletePublicKeyGroupQuery(this.sql, this.serialization).send(
        { publicKeyGroupId: publicKey.publicKeyGroupId }
      )

      return publicKey.id
    }

    return new InsertPublicKeysQuery(this.sql, this.serialization).send(
      { hexKey, publicKeyGroupId }
    )
  }
}
