/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 10:07:06 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bridge-block-set-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 11:02:27 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoSerializer } from '../xyo-serializer';
import { XyoPacker } from '../xyo-packer';
import { XyoBridgeBlockSet } from '../../xyo-core-components/arrays/xyo-bridge-block-set';
import { XyoBoundWitness } from '../../xyo-bound-witness/xyo-bound-witness';

export class XyoBridgeBlockSetSerializer extends XyoSerializer<XyoBridgeBlockSet> {

  get description () {
    return {
      major: XyoBridgeBlockSet.major,
      minor: XyoBridgeBlockSet.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const unpackedArray = new XyoArrayUnpacker(xyoPacker, buffer, true, 4);
    return new XyoBridgeBlockSet(unpackedArray.array as XyoBoundWitness[]);
  }

  public serialize(xyoBridgeBlockSet: XyoBridgeBlockSet, xyoPacker: XyoPacker) {
    const buffer = Buffer.concat(xyoBridgeBlockSet.array.map(element =>
      xyoPacker.serialize(element, false))
    );

    return Buffer.concat([
      Buffer.from([xyoBridgeBlockSet.elementMajor, xyoBridgeBlockSet.elementMinor]),
      buffer
    ]);
  }
}
