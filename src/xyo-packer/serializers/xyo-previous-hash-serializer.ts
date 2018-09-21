/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:22:35 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 11:11:03 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPreviousHash } from '../../components/hashing/xyo-previous-hash';
import { XyoHash } from '../../components/hashing/xyo-hash';
import { XYOSerializer } from '../xyo-serializer';
import { XyoPacker } from '../xyo-packer';
import { XyoError } from '../../components/xyo-error';

export class XyoPreviousHashSerializer extends XYOSerializer<XyoPreviousHash> {

  get description () {
    return {
      major: 0x02,
      minor: 0x06,
      sizeOfBytesToGetSize: 2
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const hashCreated = xyoPacker.deserialize(buffer.slice(2));
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
