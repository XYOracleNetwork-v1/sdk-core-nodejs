/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:47:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-payload-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:41:28 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPayload } from '../../xyo-core-components/xyo-payload';
import { XyoSerializer } from '../xyo-serializer';
import { XyoPacker } from '../xyo-packer';
import { XyoMultiTypeArrayInt } from '../../xyo-core-components/arrays/xyo-multi-type-array-int';

export class XyoPayloadSerializer extends XyoSerializer<XyoPayload> {

  get description () {
    return {
      major: XyoPayload.major,
      minor: XyoPayload.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  public serialize(xyoObject: XyoPayload, xyoPacker: XyoPacker) {
    return Buffer.concat([
      xyoPacker.serialize(xyoObject.signedPayload, false),
      xyoPacker.serialize(xyoObject.unsignedPayload, false)
    ]);
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker): XyoPayload {
    const signedPayloadSize = buffer.readUInt32BE(4);
    const unsignedPayloadSize = buffer.readUInt32BE(4 + signedPayloadSize);
    const signedPayload = buffer.slice(4, 4 + signedPayloadSize);
    const unsignedPayload = buffer.slice(4 + signedPayloadSize, 4 + signedPayloadSize + unsignedPayloadSize);

    const serializer = xyoPacker.getSerializerByDescriptor(XyoMultiTypeArrayInt);
    const signedPayloadCreated = serializer.deserialize(signedPayload, xyoPacker);
    const unsignedPayloadCreated = serializer.deserialize(unsignedPayload, xyoPacker);
    return new XyoPayload(signedPayloadCreated, unsignedPayloadCreated);
  }
}
