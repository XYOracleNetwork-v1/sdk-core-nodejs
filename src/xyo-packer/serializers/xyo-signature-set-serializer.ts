/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:38:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signature-set-creator.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoSignatureSet } from '../../components/arrays/xyo-signature-set';
import { XYOSerializer } from '../xyo-serializer';
import { XyoPacker } from '../xyo-packer';

export class XyoSignatureSetSerializer extends XYOSerializer<XyoSignatureSet> {

  get description () {
    return {
      major: 0x02,
      minor: 0x03,
      sizeOfBytesToGetSize: 2
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const unpackedArray = new XyoArrayUnpacker(xyoPacker, buffer, false, 2);
    return new XyoSignatureSet(unpackedArray.array);
  }

  public serialize(signatureSet: XyoSignatureSet, xyoPacker: XyoPacker) {
    return Buffer.concat(
      signatureSet.array.map(element => xyoPacker.serialize(element, element.major, element.minor, true))
    );
  }
}
