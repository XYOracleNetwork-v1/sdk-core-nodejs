/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:28:11 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-key-set-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 5:12:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../../../xyo-serialization/xyo-array-unpacker';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoKeySet } from './xyo-key-set';
import { IXyoPublicKey } from '../../../@types/xyo-signing';

/**
 * A serializer for XyoKetSet
 */
export class XyoKeySetSerializer extends XyoSerializer<XyoKeySet> {

  get description () {
    return {
      major: XyoKeySet.major,
      minor: XyoKeySet.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 2
    };
  }

  /** Get the object representation from the byte representation for a XyoKeySet */
  public deserialize(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, false, 2);
    return new XyoKeySet(unpackedArray.array as IXyoPublicKey[]);
  }

  /** Get the byte representation from the object representation for a XyoKeySet */
  public serialize(xyoKeySet: XyoKeySet) {
    return Buffer.concat(xyoKeySet.array.map(element => element.serialize(true)));
  }
}
