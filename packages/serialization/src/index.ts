/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 3:43:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 12:59:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export {
  IXyoSerializable,
  IXyoSerializationProvider,
  IXyoSerializationService,
  BufferOrString,
  SerializationType,
  IXyoTypeSerializer,
  IXyoSerializableObject,
  IXyoDeserializer,
  IXyoObjectSchema,
  IParseResult
} from './@types'

export { XyoSerializationService } from './xyo-serialization-service'
export { typedArrayOf } from './helpers/typedArrayOf'
export { untypedArrayOf } from './helpers/untypedArrayOf'
export { resolveSerializablesToBuffer } from './helpers/resolveSerializablesToBuffer'
export { fromArray } from './helpers/fromArray'
export { parse } from './helpers/parse'
export { ParseQuery } from './helpers/parse-query'
