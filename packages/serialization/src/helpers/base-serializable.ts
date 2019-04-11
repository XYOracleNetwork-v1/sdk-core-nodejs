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

import { IXyoSerializableObject, IXyoObjectSchema, IXyoObjectPartialSchema, IParseResult } from "../@types"
import { XyoBase } from "@xyo-network/base"
import { resolveSerializablesToBuffer } from "./resolveSerializablesToBuffer"
import { serialize } from "./serialize"
import { findSchemaById } from "./findSchemaById"
import { readHeader } from './readHeader'

export abstract class XyoBaseSerializable extends XyoBase implements IXyoSerializableObject {

  public abstract schemaObjectId: number
  public srcBuffer: Buffer | null = null
  public origin: Buffer | undefined

  constructor(private readonly schema: IXyoObjectSchema,  origin?: Buffer) {
    super()

    this.origin = origin
  }

  public getReadableName(): string {
    return Object.keys(this.schema).find(k => this.schema[k].id === this.schemaObjectId) || String(this.schemaObjectId)
  }

  public abstract getReadableValue(): any

  // tslint:disable-next-line:max-line-length
  public abstract getData(): Buffer | IXyoSerializableObject | IXyoSerializableObject[]

  public serialize(): Buffer {
    if (this.origin) {
      return this.origin
    }

    if (this.srcBuffer) {
      return this.srcBuffer
    }

    const serialized = (() => {
      const result = this.getData()

      if (result instanceof Buffer) {
        return serialize(
          result,
          this.findSchemaById(this.schemaObjectId, this.schema)
        )
      }

      if (Array.isArray(result)) {
        const serializationResult = this.serializablesToBuffer(result)
        return serialize(serializationResult, this.findSchemaById(this.schemaObjectId, this.schema))
      }

      return serialize(
        result.serialize(),
        this.findSchemaById(this.schemaObjectId, this.schema)
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

  public readSelfSchema (): IXyoObjectPartialSchema | undefined {
    if (this.origin) {
      return readHeader(this.origin)
    }

    return undefined
  }

  public realSchema (): IXyoObjectPartialSchema {
    return this.findSchemaById(this.schemaObjectId, this.schema)
  }

  protected serializablesToBuffer(serializables: IXyoSerializableObject[]) {
    if (this.origin) {
      return this.origin
    }

    return resolveSerializablesToBuffer(
      this.findSchemaById(this.schemaObjectId, this.schema),
      this.schema,
      serializables
    )
  }

  private findSchemaById (id: number, schema: IXyoObjectSchema): IXyoObjectPartialSchema {
    const selfSchema = this.readSelfSchema()

    if (selfSchema) {
      return selfSchema
    }

    return findSchemaById(id, schema)
  }
}
