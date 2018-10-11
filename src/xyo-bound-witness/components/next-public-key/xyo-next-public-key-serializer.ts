/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:21:37 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-next-public-key-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 11:26:39 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNextPublicKey } from './xyo-next-public-key';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoPacker } from '../../../xyo-serialization/xyo-packer';
import { XyoError } from '../../../xyo-core-components/xyo-error';
import { IXyoPublicKey } from '../../../@types/xyo-signing';

/**
 * A serializer for the `XyoNextPublicKey` object
 */

export class XyoNextPublicKeySerializer extends XyoSerializer<XyoNextPublicKey> {

  get description () {
    return {
      major: XyoNextPublicKey.major,
      minor: XyoNextPublicKey.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 0
    };
  }

  /** Get the object representation of a `XyoNextPublicKey` from the bytes representation */
  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    return new XyoNextPublicKey(xyoPacker.deserialize(buffer) as IXyoPublicKey);
  }

  /** Get the bytes representation of a `XyoNextPublicKey` from the object representation */
  public serialize(nextPublicKey: XyoNextPublicKey, xyoPacker: XyoPacker) {
    return xyoPacker.serialize(nextPublicKey.publicKey, true);
  }

  /**
   * Since the nextPublicKey is just a wrapper around an arbitrary publicKey type,
   * we delegate the reading of size to the underlying publicKey
   */
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
