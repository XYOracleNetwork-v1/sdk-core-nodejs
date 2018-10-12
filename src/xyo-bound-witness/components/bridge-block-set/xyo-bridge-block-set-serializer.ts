/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 10:07:06 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-block-set-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 5:11:34 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../../../xyo-serialization/xyo-array-unpacker';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoBridgeBlockSet } from './xyo-bridge-block-set';
import { XyoBoundWitness } from '../../bound-witness/xyo-bound-witness';

/** A serializer for `XyoBridgeBlockSet` */
export class XyoBridgeBlockSetSerializer extends XyoSerializer<XyoBridgeBlockSet> {

  get description () {
    return {
      major: XyoBridgeBlockSet.major,
      minor: XyoBridgeBlockSet.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  /** Get the object representation from the byte representation for a `XyoBridgeBlockSet`  */
  public deserialize(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, true, 4);
    return new XyoBridgeBlockSet(unpackedArray.array as XyoBoundWitness[]);
  }

  /** Get the byte representation from the object representation for a `XyoBridgeBlockSet` */
  public serialize(xyoBridgeBlockSet: XyoBridgeBlockSet) {
    const buffer = Buffer.concat(xyoBridgeBlockSet.array.map(element =>
      element.serialize(false))
    );

    return Buffer.concat([
      Buffer.from([xyoBridgeBlockSet.elementMajor, xyoBridgeBlockSet.elementMinor]),
      buffer
    ]);
  }
}
