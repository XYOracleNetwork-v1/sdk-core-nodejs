/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:47:47 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-payload-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 5:14:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPayload } from './xyo-payload';
import { XyoSerializer } from '../../../xyo-serialization/xyo-serializer';
import { XyoMultiTypeArrayInt } from '../../../xyo-core-components/arrays/multi/xyo-multi-type-array-int';
import { XyoObject } from '../../../xyo-core-components/xyo-object';

/** A serializer for the `XyoPayload` object */
export class XyoPayloadSerializer extends XyoSerializer<XyoPayload> {

  get description () {
    return {
      major: XyoPayload.major,
      minor: XyoPayload.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  /** Get the byte representation from the object representation for a XyoPayload */
  public serialize(xyoObject: XyoPayload) {
    return Buffer.concat([
      xyoObject.signedPayload.serialize(false),
      xyoObject.unsignedPayload.serialize(false)
    ]);
  }

  /** Get the object representation from the byte representation for a XyoPayload */
  public deserialize(buffer: Buffer): XyoPayload {
    const signedPayloadSize = buffer.readUInt32BE(4);
    const unsignedPayloadSize = buffer.readUInt32BE(4 + signedPayloadSize);
    const signedPayload = buffer.slice(4, 4 + signedPayloadSize);
    const unsignedPayload = buffer.slice(4 + signedPayloadSize, 4 + signedPayloadSize + unsignedPayloadSize);

    const serializer = XyoMultiTypeArrayInt.getSerializer<XyoMultiTypeArrayInt>();
    const signedPayloadCreated = serializer.deserialize(signedPayload);
    const unsignedPayloadCreated = serializer.deserialize(unsignedPayload);
    return new XyoPayload(signedPayloadCreated, unsignedPayloadCreated);
  }
}
