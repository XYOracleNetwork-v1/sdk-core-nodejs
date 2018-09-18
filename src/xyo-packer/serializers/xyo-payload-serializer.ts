/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:47:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-payload-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 3:36:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPayload } from '../../components/xyo-payload';
import { XYOSerializer } from '../xyo-serializer';
import { XyoPacker } from '../xyo-packer';
import { XyoMultiTypeArrayInt } from '../../components/arrays/xyo-multi-type-array-int';

export class XyoPayloadSerializer extends XYOSerializer<XyoPayload> {

  public serialize(xyoObject: XyoPayload, xyoPacker: XyoPacker) {
    return Buffer.concat([
      xyoPacker.serialize(
        xyoObject.signedPayload,
        xyoObject.signedPayload.major,
        xyoObject.signedPayload.minor,
        false
      ),
      xyoPacker.serialize(
        xyoObject.unsignedPayload,
        xyoObject.unsignedPayload.major,
        xyoObject.unsignedPayload.minor,
        false
      )
    ]);
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker): XyoPayload {
    const signedPayloadSize = buffer.readUInt32BE(4);
    const unsignedPayloadSize = buffer.readUInt32BE(4 + signedPayloadSize);
    const signedPayload = buffer.slice(4, 4 + signedPayloadSize);
    const unsignedPayload = buffer.slice(4 + signedPayloadSize, 4 + signedPayloadSize + unsignedPayloadSize);

    const serializer = xyoPacker.getSerializerByName(XyoMultiTypeArrayInt.name);
    const signedPayloadCreated = serializer.deserialize(signedPayload, xyoPacker);
    const unsignedPayloadCreated = serializer.deserialize(unsignedPayload, xyoPacker);
    return new XyoPayload(signedPayloadCreated, unsignedPayloadCreated);
  }

  get description () {
    return {
      major: 0x02,
      minor: 0x04,
      sizeOfBytesToGetSize: 4
    };
  }
}
