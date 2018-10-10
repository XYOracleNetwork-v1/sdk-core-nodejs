/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 9th October 2018 10:42:21 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 10th October 2018 5:50:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * All serialization is predicated on a major/minor scheme. This scheme
 * identifies a particular schema to serialize and deserialize arbitrary
 * blobs of data into useful objects
 */
// tslint:disable-next-line:no-empty-interface
export interface IXyoObjectDescriptor {
  /** The major value of the object being serialized */
  major: number;

  /** The minor value of the object being serialized */
  minor: number;
}

/**
 * In addition the object-descriptor properties, more properties are
 * required to be able to effectively serialize and deserialized objects
 * reliably and optimally.
 */
export interface IXyoSerializationDescription extends IXyoObjectDescriptor {
  /** If the value being serialized is a fixed amount of bytes, this property should be set to that value */
  staticSize?: number;

  /** This value specifies how many bytes are needed to read the size when deserializing */
  sizeOfBytesToGetSize?: number;

  /** The number of bytes necessary to encode the size of value in bytes. Should be `0` if a staticSize is provided */
  sizeIdentifierSize: number;
}
