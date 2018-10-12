/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:22:35 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 5:15:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPreviousHash } from './xyo-previous-hash';
import { XyoHash } from '../../../xyo-hashing/xyo-hash';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoError, XyoErrors } from '../../../xyo-core-components/xyo-error';
import { XyoObject } from '../../../xyo-core-components/xyo-object';

/** A serializer for the `XyoPreviousHash` object */
export class XyoPreviousHashSerializer extends XyoSerializer<XyoPreviousHash> {

  get description () {
    return {
      major: XyoPreviousHash.major,
      minor: XyoPreviousHash.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 0
    };
  }

  /** Get the object representation from the byte representation for a XyoPreviousHash */
  public deserialize(buffer: Buffer) {
    const hashCreated = XyoObject.deserialize(buffer);
    return new XyoPreviousHash(hashCreated as XyoHash);
  }

  /** Get the byte representation from the object representation for a XyoPreviousHash */
  public serialize(xyoObject: XyoPreviousHash) {
    return xyoObject.hash.serialize(true);
  }

  /**
   * A PreviousHash is wrapper around an arbitrary XyoHash.
   * As such, we delegate the reading of size to the underlying XyoHash object
   */

  public readSize(buffer: Buffer) {
    const hashCreator = XyoObject.getSerializerByMajorMinor(buffer[0], buffer[1]);
    if (hashCreator === undefined) {
      throw new XyoError(`Error reading size in XyoPreviousHashSerializer`, XyoErrors.CREATOR_MAPPING);
    }

    return hashCreator.readSize(buffer.slice(2, 2 + hashCreator.sizeOfBytesToRead)) + 2;
  }
}
