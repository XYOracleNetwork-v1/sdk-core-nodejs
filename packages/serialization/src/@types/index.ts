/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:22:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 12:09:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoTreeIterator } from "../helpers/tree-iterator"
export interface IXyoObjectPartialSchema {

  /**
   * How many bytes necessary to encode size of object
   */
  sizeIdentifierSize: 1 | 2 | 4 | 8 | null

  /**
   * Is the value that is being encoded iterable and if so is it typed
   */
  iterableType: IIterableType | null

  /**
   * What is the id of the schema
   */
  id: number
}

export type IIterableType = 'not-iterable' | 'iterable-typed' | 'iterable-untyped'

export interface IXyoObjectSchema {
  [s: string]: IXyoObjectPartialSchema
}

/** Either a Buffer or a hex-string */
export type SerializationType = 'buffer' | 'hex'

/** The type that can be returned */
export type BufferOrString = Buffer | string

export interface IXyoSerializationService {

  schema: IXyoObjectSchema

  /**
   * Will serialize an xyo object. If serialization type is hex, will return the hex-string
   * representation of the object in question
   *
   * @param {IXyoSerializableObject} serializable
   * @param {SerializationType} [serializationType] Optional, defaults to Buffer
   * @returns {BufferOrString} Will return a Buffer or an hex-string based off of `serializationType`
   * @memberof IXyoSerializationService
   */
  serialize(
    serializable: IXyoSerializableObject | IXyoSerializableObject[],
    serializationType?: SerializationType
  ): BufferOrString

  /**
   * Will deserialize an xyo object from a buffer or hex-string to the object representation
   *
   * @template T
   * @param {BufferOrString} deserializable
   * @returns {T}
   * @memberof IXyoSerializationService
   */
  deserialize(deserializable: BufferOrString): XyoTreeIterator

  hydrate<T extends IXyoSerializableObject>(deserializable: IParseResult): T
  parse(src: Buffer): IParseResult

  arrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject
  typedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject
  untypedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject
  findFirstElement<T extends IXyoSerializableObject>(
    collection: IXyoSerializableObject[], schemaObjectId: number
  ): T | undefined
}

export interface IXyoSerializableObject {
  origin: Buffer | undefined
  schemaObjectId: number
  srcBuffer: Buffer | null
  getData(): Buffer | IXyoSerializableObject | IXyoSerializableObject[]
  serialize(): Buffer
  serializeHex(): string
  getReadableName(): string
  getReadableValue(): any
  isEqual(other: IXyoSerializableObject): boolean
  realSchema (): IXyoObjectPartialSchema
}

export interface IXyoDeserializer<T extends IXyoSerializableObject> {
  schemaObjectId: number
  deserialize(data: Buffer, serializationService: IXyoSerializationService): T
}

export interface IParseResult {
  data: Buffer | IParseResult[]
  id: number
  sizeIdentifierSize: 1 | 2 | 4 | 8
  iterableType: 'iterable-typed' | 'iterable-untyped' | 'not-iterable',
  dataBytes: Buffer
  headerBytes: Buffer
}

export interface IOnTheFlyGetDataOptions {
  buffer?: Buffer,
  object?: IXyoSerializableObject
  array?: IXyoSerializableObject[]
  fn?: () => Buffer | IXyoSerializableObject | IXyoSerializableObject[]
}
