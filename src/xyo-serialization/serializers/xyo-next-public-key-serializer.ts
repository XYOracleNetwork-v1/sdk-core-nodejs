/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:21:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-next-public-key-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:08:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNextPublicKey } from '../../xyo-signing/xyo-next-public-key';
import { XyoSerializer } from '../xyo-serializer';
import { XyoPacker } from '../xyo-packer';
import { XyoError } from '../../xyo-core-components/xyo-error';
import { IXyoPublicKey } from '../../@types/xyo-signing';

export class XyoNextPublicKeySerializer extends XyoSerializer<XyoNextPublicKey> {

  get description () {
    return {
      major: XyoNextPublicKey.major,
      minor: XyoNextPublicKey.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 0
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    return new XyoNextPublicKey(xyoPacker.deserialize(buffer) as IXyoPublicKey);
  }

  public serialize(nextPublicKey: XyoNextPublicKey, xyoPacker: XyoPacker) {
    return xyoPacker.serialize(nextPublicKey.publicKey, true);
  }

  public readSize(buffer: Buffer, xyoPacker: XyoPacker) {
    const publicKeyCreatorValue = xyoPacker.getSerializerByMajorMinor(buffer[0], buffer[1]);
    if (publicKeyCreatorValue === undefined) {
      throw new XyoError(
        `Error reading size in XyoNextPublicKeySerializer`,
        XyoError.errorType.ERR_CREATOR_MAPPING
      );
    }

    const buf = buffer.slice(2, 2 + publicKeyCreatorValue.sizeOfBytesToRead);
    return publicKeyCreatorValue.readSize(buf, xyoPacker) + 2;
  }
}
