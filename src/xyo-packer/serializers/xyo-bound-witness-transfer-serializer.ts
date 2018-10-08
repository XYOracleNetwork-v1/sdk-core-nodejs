/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:50:44 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-transfer-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:42:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessTransfer } from '../../components/bound-witness/xyo-bound-witness-transfer';
import { XyoObject } from '../../components/xyo-object';
import { XyoSerializer } from '../xyo-serializer';
import { XyoPayload } from '../../components/xyo-payload';
import { XyoSignatureSet } from '../../components/arrays/xyo-signature-set';
import { XyoKeySet } from '../../components/arrays/xyo-key-set';
import { XyoPacker } from '../xyo-packer';
import { XyoSingleTypeArrayShort } from '../../components/arrays/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../../components/arrays/xyo-single-type-array-int';

export class XyoBoundWitnessTransferSerializer extends XyoSerializer<XyoBoundWitnessTransfer> {

  get description () {
    return {
      major: XyoBoundWitnessTransfer.major,
      minor: XyoBoundWitnessTransfer.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const type = buffer[4];
    let currentOffset = 5;

    let keySetArray: XyoSingleTypeArrayShort | null = null;
    let payloadArray: XyoSingleTypeArrayInt | null = null;
    let signatureArray: XyoSingleTypeArrayShort | null = null;

    const singleTypeArrayShortSerializer = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayShort);
    const singleTypeArrayIntSerializer = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayInt);
    const shortArrayReadSizeValue = singleTypeArrayShortSerializer.sizeOfBytesToRead;
    const intArrayReadSizeValue = singleTypeArrayIntSerializer.sizeOfBytesToRead;

    if (type === 0x01 || type === 0x02) {
      const keySetArraySizeValue = singleTypeArrayShortSerializer.readSize(
        buffer.slice(currentOffset, currentOffset + shortArrayReadSizeValue), xyoPacker
      );

      keySetArray = singleTypeArrayShortSerializer.deserialize(
        buffer.slice(currentOffset, currentOffset + keySetArraySizeValue), xyoPacker
      );
      currentOffset += keySetArraySizeValue;

      const payloadArraySizeValue = singleTypeArrayIntSerializer.readSize(
        buffer.slice(currentOffset, currentOffset + intArrayReadSizeValue), xyoPacker
      );

      payloadArray = singleTypeArrayIntSerializer.deserialize(
        buffer.slice(currentOffset, currentOffset + payloadArraySizeValue), xyoPacker
      );
      currentOffset += payloadArraySizeValue;
    }

    if (type === 0x02 || type === 0x03) {
      const signatureArraySizeValue = singleTypeArrayShortSerializer.readSize(
        buffer.slice(currentOffset, currentOffset + shortArrayReadSizeValue), xyoPacker
      );

      signatureArray = singleTypeArrayShortSerializer.deserialize(
        buffer.slice(currentOffset, currentOffset + signatureArraySizeValue), xyoPacker
      );
      currentOffset += signatureArraySizeValue;
    }

    const keySetArrayValue: XyoObject[] = keySetArray && keySetArray.array || [];
    const payloadArrayValue: XyoObject[] = payloadArray && payloadArray.array || [];
    const signatureArrayValue: XyoObject[] = signatureArray && signatureArray.array || [];

    return new XyoBoundWitnessTransfer(keySetArrayValue, payloadArrayValue, signatureArrayValue);
  }

  public serialize(boundWitnessTransfer: XyoBoundWitnessTransfer, xyoPacker: XyoPacker) {
    let keySetArray: Buffer | null = null;
    let payloadArray: Buffer | null = null;
    let signatureArray: Buffer | null = null;

    if (boundWitnessTransfer.stage === 0x01 || boundWitnessTransfer.stage === 0x02) {
      const keySetArrayInstance = new XyoSingleTypeArrayShort(
        XyoKeySet.major,
        XyoKeySet.minor,
        boundWitnessTransfer.keysToSend
      );

      keySetArray = xyoPacker.serialize(keySetArrayInstance, false);

      const payloadArrayInstance = new XyoSingleTypeArrayInt(
        XyoPayload.major,
        XyoPayload.minor,
        boundWitnessTransfer.payloadsToSend
      );

      payloadArray = xyoPacker.serialize(payloadArrayInstance, false);
    }

    if (boundWitnessTransfer.stage === 0x02 || boundWitnessTransfer.stage === 0x03) {
      const signatureArrayInstance = new XyoSingleTypeArrayShort(
        XyoSignatureSet.major,
        XyoSignatureSet.minor,
        boundWitnessTransfer.signatureToSend
      );

      signatureArray = xyoPacker.serialize(signatureArrayInstance, false);
    }

    const notNullValues = [
      keySetArray,
      payloadArray,
      signatureArray
    ].filter(item => item !== null) as Buffer[];

    return Buffer.concat([
      Buffer.from([boundWitnessTransfer.stage]),
      ...notNullValues
    ]);
  }
}
