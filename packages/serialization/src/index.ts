/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:51:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 6:15:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/** Either a Buffer or a hex-string */
export type SerializationType = 'buffer' | 'hex'

/** The type that can be returned */
export type SerializationValueType = Buffer | string

export interface IXyoSerializationService {

  /**
   * Will serialize an xyo object. If serialization type is hex, will return the hex-string
   * representation of the object in question
   *
   * @param {*} serializable
   * @param {SerializationType} [serializationType] Optional, defaults to Buffer
   * @returns {SerializationValueType} Will return a Buffer or an hex-string based off of `serializationType`
   * @memberof IXyoSerializationService
   */
  serialize(serializable: any, serializationType?: SerializationType): SerializationValueType

  /**
   * Will deserialize an xyo object from a buffer or hex-string to the object representation
   *
   * @template T
   * @param {SerializationValueType} deserializable
   * @returns {T}
   * @memberof IXyoSerializationService
   */
  deserialize<T>(deserializable: SerializationValueType): T
}
