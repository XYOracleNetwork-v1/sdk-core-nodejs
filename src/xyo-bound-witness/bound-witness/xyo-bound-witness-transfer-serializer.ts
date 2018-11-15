/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:50:44 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-transfer-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 5:09:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessTransfer } from './xyo-bound-witness-transfer';
import { IXyoObject } from '../../xyo-core-components/xyo-object';
import { XyoSerializer } from '../../xyo-serialization/xyo-serializer';
import { XyoPayload } from '../components/payload/xyo-payload';
import { XyoSignatureSet } from '../components/signature-set/xyo-signature-set';
import { XyoKeySet } from '../components/key-set/xyo-key-set';
import { XyoSingleTypeArrayShort } from '../../xyo-core-components/arrays/single/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../../xyo-core-components/arrays/single/xyo-single-type-array-int';

/**
 * The serializer for an XyoBoundWitnessTransfer
 */
export class XyoBoundWitnessTransferSerializer extends XyoSerializer<XyoBoundWitnessTransfer> {

  get description () {
    return {
      major: XyoBoundWitnessTransfer.major,
      minor: XyoBoundWitnessTransfer.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  /** Get the object representation of a XyoBoundWitnessTransfer from the bytes representation */
  public deserialize(buffer: Buffer) {
    // The first 4 bytes, buffer[0], buffer[1], buffer[2], buffer[3] are the size bytes
    const type = buffer[4]; // The type byte is located at index 4, this represents the state of the transfer
    let currentOffset = 5;

    let keySetArray: XyoSingleTypeArrayShort | null = null;
    let payloadArray: XyoSingleTypeArrayInt | null = null;
    let signatureArray: XyoSingleTypeArrayShort | null = null;

    const singleTypeArrayShortSerializer = XyoSingleTypeArrayShort.getSerializer<XyoSingleTypeArrayShort>();
    const singleTypeArrayIntSerializer = XyoSingleTypeArrayInt.getSerializer<XyoSingleTypeArrayInt>();
    const shortArrayReadSizeValue = singleTypeArrayShortSerializer.sizeOfBytesToRead;
    const intArrayReadSizeValue = singleTypeArrayIntSerializer.sizeOfBytesToRead;

    /**
     * Depending on the stage/type, there will different values to look for
     *
     * if stage 1 or 2, keysets and payloads will be passed.
     * if stage 2 or 3 signatures will be passed
     */

    if (type === 0x01 || type === 0x02) {
      const keySetArraySizeValue = singleTypeArrayShortSerializer.readSize(
        buffer.slice(currentOffset, currentOffset + shortArrayReadSizeValue)
      );

      keySetArray = singleTypeArrayShortSerializer.deserialize(
        buffer.slice(currentOffset, currentOffset + keySetArraySizeValue)
      );
      currentOffset += keySetArraySizeValue;

      const payloadArraySizeValue = singleTypeArrayIntSerializer.readSize(
        buffer.slice(currentOffset, currentOffset + intArrayReadSizeValue)
      );

      payloadArray = singleTypeArrayIntSerializer.deserialize(
        buffer.slice(currentOffset, currentOffset + payloadArraySizeValue)
      );
      currentOffset += payloadArraySizeValue;
    }

    if (type === 0x02 || type === 0x03) {
      const signatureArraySizeValue = singleTypeArrayShortSerializer.readSize(
        buffer.slice(currentOffset, currentOffset + shortArrayReadSizeValue)
      );

      signatureArray = singleTypeArrayShortSerializer.deserialize(
        buffer.slice(currentOffset, currentOffset + signatureArraySizeValue)
      );
      currentOffset += signatureArraySizeValue;
    }

    const keySetArrayValue: IXyoObject[] = keySetArray && keySetArray.array || [];
    const payloadArrayValue: IXyoObject[] = payloadArray && payloadArray.array || [];
    const signatureArrayValue: IXyoObject[] = signatureArray && signatureArray.array || [];

    return new XyoBoundWitnessTransfer(keySetArrayValue, payloadArrayValue, signatureArrayValue);
  }

  /**
   * Get the bytes representation of a `XyoBoundWitnessTransfer`
   */
  public serialize(boundWitnessTransfer: XyoBoundWitnessTransfer) {
    let keySetArray: Buffer | null = null;
    let payloadArray: Buffer | null = null;
    let signatureArray: Buffer | null = null;

    /** Pack the keysets and payloads only if its stage 1 or 2 */
    if (boundWitnessTransfer.stage === 0x01 || boundWitnessTransfer.stage === 0x02) {
      const keySetArrayInstance = new XyoSingleTypeArrayShort(
        XyoKeySet.major,
        XyoKeySet.minor,
        boundWitnessTransfer.keysToSend
      );

      keySetArray = keySetArrayInstance.serialize(false);

      const payloadArrayInstance = new XyoSingleTypeArrayInt(
        XyoPayload.major,
        XyoPayload.minor,
        boundWitnessTransfer.payloadsToSend
      );

      payloadArray = payloadArrayInstance.serialize(false);
    }

    /** Pack the signatures only if stage 2 or 3 */
    if (boundWitnessTransfer.stage === 0x02 || boundWitnessTransfer.stage === 0x03) {
      const signatureArrayInstance = new XyoSingleTypeArrayShort(
        XyoSignatureSet.major,
        XyoSignatureSet.minor,
        boundWitnessTransfer.signatureToSend
      );

      signatureArray = signatureArrayInstance.serialize(false);
    }

    /** Only include the not null values in the serialization */
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
