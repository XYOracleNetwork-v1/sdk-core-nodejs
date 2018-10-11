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

import { XyoArrayUnpacker } from '../../../xyo-serialization/xyo-array-unpacker';
import { XyoSignatureSet } from './xyo-signature-set';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';

/** A serializer for `XyoSignatureSet` */
export class XyoSignatureSetSerializer extends XyoSerializer<XyoSignatureSet> {

  get description () {
    return {
      major: XyoSignatureSet.major,
      minor: XyoSignatureSet.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 2
    };
  }

  /** Get the object representation from the bytes representation of a XyoSignatureSet */
  public deserialize(buffer: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(buffer, false, 2);
    return new XyoSignatureSet(unpackedArray.array);
  }

  /** Get the bytes representation from the object representation of a XyoSignatureSet */
  public serialize(signatureSet: XyoSignatureSet) {
    return Buffer.concat(
      signatureSet.array.map(element => element.serialize(true))
    );
  }
}
