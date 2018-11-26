/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:22:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 1:25:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectSchema } from '@xyo-network/object-schema'

/** Either a Buffer or a hex-string */
export type SerializationType = 'buffer' | 'hex'

/** The type that can be returned */
export type BufferOrString = Buffer | string

export interface IXyoSerializationService {

  /**
   * Will serialize an xyo object. If serialization type is hex, will return the hex-string
   * representation of the object in question
   *
   * @param {*} serializable
   * @param {SerializationType} [serializationType] Optional, defaults to Buffer
   * @returns {BufferOrString} Will return a Buffer or an hex-string based off of `serializationType`
   * @memberof IXyoSerializationService
   */
  serialize<T>(serializable: IXyoSerializable<T>, serializationType?: SerializationType): BufferOrString

  /**
   * Will deserialize an xyo object from a buffer or hex-string to the object representation
   *
   * @template T
   * @param {BufferOrString} deserializable
   * @returns {T}
   * @memberof IXyoSerializationService
   */
  deserialize<T>(deserializable: BufferOrString): T
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
  getData(object: T): Buffer
  getHeader(size: number, t?: T): Buffer
  deserialize(deserializable: BufferOrString): T
  getId(t?: T): number
}

export interface IXyoSerializableObject {
  schemaObjectId: number

  // tslint:disable-next-line:prefer-array-literal
  serialize(): Buffer | IXyoSerializableObject[]
}
