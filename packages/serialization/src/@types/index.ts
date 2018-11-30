/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:22:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 9:43:20 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

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

export interface IXyoReadable {
  getReadableName(): string
  getReadableValue(): any
  getReadableJSON(): string
}

export interface IXyoObjectSchema {
  [s: string]: IXyoObjectPartialSchema
}

/** Either a Buffer or a hex-string */
export type SerializationType = 'buffer' | 'hex'

/** The type that can be returned */
export type BufferOrString = Buffer | string

export interface IXyoSerializationService {

  /**
   * Will serialize an xyo object. If serialization type is hex, will return the hex-string
   * representation of the object in question
   *
   * @param {IXyoSerializableObject} serializable
   * @param {SerializationType} [serializationType] Optional, defaults to Buffer
   * @returns {BufferOrString} Will return a Buffer or an hex-string based off of `serializationType`
   * @memberof IXyoSerializationService
   */
  serialize(serializable: IXyoSerializableObject, serializationType?: SerializationType): BufferOrString

  /**
   * Will deserialize an xyo object from a buffer or hex-string to the object representation
   *
   * @template T
   * @param {BufferOrString} deserializable
   * @returns {T}
   * @memberof IXyoSerializationService
   */
  deserialize<T extends IXyoSerializableObject>(deserializable: BufferOrString): T

  /**
   * Creates a typed serializer
   *
   * @template T
   * @returns {IXyoTypeSerializer<T>}
   * @memberof IXyoSerializationService
   */
  getInstanceOfTypeSerializer<T extends IXyoSerializableObject>(): IXyoTypeSerializer<T>
}

export interface IXyoSerializationProvider<T> {
  toBytes(object: T): Buffer
  fromBytes(bytes: Buffer): T
}

export interface IXyoSerializable<T> {
  schemaObjectId: number
  schema: IXyoObjectSchema
  value: T
}

export interface IXyoTypeSerializer<T> {
  serialize(object: T, serializationType?: SerializationType): BufferOrString
  deserialize(deserializable: BufferOrString): T
}

export interface IXyoSerializableObject {
  schemaObjectId: number
  val?: any

  // tslint:disable-next-line:prefer-array-literal
  serialize(): Buffer | IXyoSerializableObject[]
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
  bytes: Buffer
}
