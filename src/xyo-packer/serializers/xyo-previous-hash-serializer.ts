/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:22:35 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPreviousHash } from '../../components/hashing/xyo-previous-hash';
import { XyoHash } from '../../components/hashing/xyo-hash';
import { XyoSerializer } from '../xyo-serializer';
import { XyoPacker } from '../xyo-packer';
import { XyoError } from '../../components/xyo-error';

export class XyoPreviousHashSerializer extends XyoSerializer<XyoPreviousHash> {

  get description () {
    return {
      major: XyoPreviousHash.major,
      minor: XyoPreviousHash.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 0
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const hashCreated = xyoPacker.deserialize(buffer);
    return new XyoPreviousHash(hashCreated as XyoHash);
  }

  public serialize(xyoObject: XyoPreviousHash, xyoPacker: XyoPacker) {
    return xyoPacker.serialize(xyoObject.hash, xyoObject.hash.major, xyoObject.hash.minor, true);
  }

  public readSize(buffer: Buffer, xyoPacker: XyoPacker) {
    const hashCreator = xyoPacker.getSerializerByMajorMinor(buffer[0], buffer[1]);
    if (hashCreator === undefined) {
      throw new XyoError(`Error reading size in XyoPreviousHashSerializer`, XyoError.errorType.ERR_CREATOR_MAPPING);
    }

    return hashCreator.readSize(buffer.slice(2, 2 + hashCreator.sizeOfBytesToRead), xyoPacker) + 2;
  }
}
