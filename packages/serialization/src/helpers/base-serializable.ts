/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 5th December 2018 10:30:22 am
 * @Email:  developer@xyfindables.com
 * @Filename: base-serializable.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 12:09:57 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject, IXyoObjectSchema } from "../@types"
import { XyoBase } from "@xyo-network/base"
import { resolveSerializablesToBuffer } from "./resolveSerializablesToBuffer"
import { serialize } from "./serialize"
import { findSchemaById } from "./findSchemaById"

export abstract class XyoBaseSerializable extends XyoBase implements IXyoSerializableObject {

  public abstract schemaObjectId: number
  public srcBuffer: Buffer | null = null

  constructor(private readonly schema: IXyoObjectSchema) {
    super()
  }

  public getReadableName(): string {
    return Object.keys(this.schema).find(k => this.schema[k].id === this.schemaObjectId) || String(this.schemaObjectId)
  }

  public abstract getReadableValue(): any

  // tslint:disable-next-line:max-line-length
  public abstract getData(): Buffer | IXyoSerializableObject | IXyoSerializableObject[]

  public serialize(): Buffer {
    if (this.srcBuffer) {
      return this.srcBuffer
    }

    const serialized = (() => {
      const result = this.getData()

      if (result instanceof Buffer) {
        return serialize(
          result,
          findSchemaById(this.schemaObjectId, this.schema)
        )
      }

      if (Array.isArray(result)) {
        const serializationResult = this.serializablesToBuffer(result)
        return serialize(serializationResult, findSchemaById(this.schemaObjectId, this.schema))
      }

      return serialize(
        result.serialize(),
        findSchemaById(this.schemaObjectId, this.schema)
      )
    })()

    this.srcBuffer = serialized
    return serialized
  }

  public serializeHex(): string {
    return this.serialize().toString('hex')
  }

  public isEqual(other: IXyoSerializableObject) {
    return this.serialize().equals(other.serialize())
  }

  protected serializablesToBuffer(serializables: IXyoSerializableObject[]) {
    return resolveSerializablesToBuffer(
      this.schemaObjectId,
      this.schema,
      serializables
    )
  }
}
