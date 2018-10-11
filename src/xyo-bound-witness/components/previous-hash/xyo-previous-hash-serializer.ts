/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:22:35 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 11:36:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPreviousHash } from './xyo-previous-hash';
import { XyoHash } from '../../../xyo-hashing/xyo-hash';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoPacker } from '../../../xyo-serialization/xyo-packer';
import { XyoError } from '../../../xyo-core-components/xyo-error';

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
  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const hashCreated = xyoPacker.deserialize(buffer);
    return new XyoPreviousHash(hashCreated as XyoHash);
  }

  /** Get the byte representation from the object representation for a XyoPreviousHash */
  public serialize(xyoObject: XyoPreviousHash, xyoPacker: XyoPacker) {
    return xyoPacker.serialize(xyoObject.hash, true);
  }

  /**
   * A PreviousHash is wrapper around an arbitrary XyoHash.
   * As such, we delegate the reading of size to the underlying XyoHash object
   */

  public readSize(buffer: Buffer, xyoPacker: XyoPacker) {
    const hashCreator = xyoPacker.getSerializerByMajorMinor(buffer[0], buffer[1]);
    if (hashCreator === undefined) {
      throw new XyoError(`Error reading size in XyoPreviousHashSerializer`, XyoError.errorType.ERR_CREATOR_MAPPING);
    }

    return hashCreator.readSize(buffer.slice(2, 2 + hashCreator.sizeOfBytesToRead), xyoPacker) + 2;
  }
}
