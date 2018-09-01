/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 4:39:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-transfer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th September 2018 11:02:19 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoResult } from '../xyo-result';
import { XyoError } from '../xyo-error';
import { XyoKeySet } from '../arrays/multi/xyo-key-set';
import { XyoSingleTypeArrayShort } from '../arrays/single/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../arrays/single/xyo-single-type-array-int';
import { XyoPayload } from '../xyo-payload';
import { XyoSignatureSet } from '../arrays/multi/xyo-signature-set';

export class XyoBoundWitnessTransferObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x02;
  }

  get minor () {
    return 0x08;
  }

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(4);
  }

  public createFromPacked(buffer: Buffer) {
    const stage = buffer[4];
    return this.unpackEverything(buffer, 5, stage);
  }

  public readSize(buffer: Buffer) {
    return XyoResult.withValue(buffer.readUInt32BE(0));
  }

  private unpackEverything(buffer: Buffer, globalOffset: number, type: number): XyoResult<XyoBoundWitnessTransfer> {
    let currentOffset = globalOffset;

    let keySetArray: XyoSingleTypeArrayShort | null = null;
    let payloadArray: XyoSingleTypeArrayInt | null = null;
    let signatureArray: XyoSingleTypeArrayShort | null = null;

    const shortArrayReadSize = XyoSingleTypeArrayShort.creator.sizeOfBytesToGetSize;
    if (shortArrayReadSize.hasError()) {
      return XyoResult.withError(shortArrayReadSize.error!);
    }
    const shortArrayReadSizeValue = shortArrayReadSize.value!;

    const intArrayReadSize = XyoSingleTypeArrayInt.creator.sizeOfBytesToGetSize;
    if (intArrayReadSize.hasError()) {
      return XyoResult.withError(intArrayReadSize.error!);
    }

    const intArrayReadSizeValue = intArrayReadSize.value!;

    if (type === 0x01 || type === 0x02) {
      const keySetArraySize = XyoSingleTypeArrayShort.creator.readSize(
        buffer.slice(currentOffset, currentOffset + shortArrayReadSizeValue)
      );
      if (keySetArraySize.hasError()) {
        return XyoResult.withError(keySetArraySize.error!);
      }
      const keySetArraySizeValue = keySetArraySize.value!;

      const keySetArrayResult = XyoSingleTypeArrayShort.creator.createFromPacked(
        buffer.slice(currentOffset, currentOffset + keySetArraySizeValue)
      );
      if (keySetArrayResult.hasError()) {
        return XyoResult.withError(keySetArrayResult.error!);
      }

      keySetArray = keySetArrayResult.value!;
      currentOffset += keySetArraySizeValue;

      const payloadArraySize = XyoSingleTypeArrayInt.creator.readSize(
        buffer.slice(currentOffset, currentOffset + intArrayReadSizeValue)
      );
      if (payloadArraySize.hasError()) {
        return XyoResult.withError(payloadArraySize.error!);
      }

      const payloadArraySizeValue = payloadArraySize.value!;
      const payloadArrayResult = XyoSingleTypeArrayInt.creator.createFromPacked(
        buffer.slice(currentOffset, currentOffset + payloadArraySizeValue)
      );

      if (payloadArrayResult.hasError()) {
        return XyoResult.withError(payloadArrayResult.error!);
      }

      payloadArray = payloadArrayResult.value as XyoSingleTypeArrayInt;
      currentOffset += payloadArraySizeValue;
    }

    if (type === 0x02 || type === 0x03) {
      const signatureArraySize = XyoSingleTypeArrayShort.creator.readSize(
        buffer.slice(currentOffset, currentOffset + shortArrayReadSizeValue)
      );

      if (signatureArraySize.hasError()) {
        return XyoResult.withError(signatureArraySize.error!);
      }
      const signatureArraySizeValue = signatureArraySize.value!;

      const signatureArrayResult = XyoSingleTypeArrayShort.creator.createFromPacked(
        buffer.slice(currentOffset, currentOffset + signatureArraySizeValue)
      );
      if (signatureArrayResult.hasError()) {
        return XyoResult.withError(signatureArrayResult.error!);
      }
      signatureArray = signatureArrayResult.value!;
      currentOffset += signatureArraySizeValue;
    }

    const keySetArrayValue: XyoObject[] = keySetArray && keySetArray.array || [];
    const payloadArrayValue: XyoObject[] = payloadArray && payloadArray.array || [];
    const signatureArrayValue: XyoObject[] = signatureArray && signatureArray.array || [];

    return XyoResult.withValue(
      new XyoBoundWitnessTransfer(keySetArrayValue, payloadArrayValue, signatureArrayValue)
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoBoundWitnessTransfer extends XyoObject {

  public static creator = new XyoBoundWitnessTransferObjectCreator();

  private get stage() {
    if (this.keysToSend.length > 0 && this.payloadsToSend.length > 0 && this.signatureToSend.length === 0) {
      return 0x01;
    }

    if (this.keysToSend.length > 0 && this.payloadsToSend.length > 0 && this.signatureToSend.length > 0) {
      return 0x02;
    }

    if (this.keysToSend.length === 0 && this.payloadsToSend.length === 0 && this.signatureToSend.length > 0) {
      return 0x03;
    }

    return 0x01;
  }

  constructor(
    public readonly keysToSend: XyoObject[],
    public readonly payloadsToSend: XyoObject[],
    public readonly signatureToSend: XyoObject[]
  ) {
    super();
  }

  get data () {
    return this.makeWithEverything();
  }

  get id () {
    return XyoBoundWitnessTransfer.creator.id;
  }

  get sizeIdentifierSize () {
    return XyoBoundWitnessTransfer.creator.sizeOfBytesToGetSize;
  }

  private makeWithEverything(): XyoResult<Buffer> {
    let keySetArray: Buffer | null = null;
    let payloadArray: Buffer | null = null;
    let signatureArray: Buffer | null = null;

    if (this.stage === 0x01 || this.stage === 0x02) {
      const encodedKeySets = new XyoSingleTypeArrayShort(
        XyoKeySet.creator.major,
        XyoKeySet.creator.minor,
        this.keysToSend
      ).unTyped;

      if (encodedKeySets.hasError())  {
        return XyoResult.withError(encodedKeySets.error!);
      }

      keySetArray = encodedKeySets.value!;

      const encodedPayloads = new XyoSingleTypeArrayInt(
        XyoPayload.creator.major,
        XyoPayload.creator.minor,
        this.payloadsToSend
      ).unTyped;

      if (encodedPayloads.hasError()) {
        return XyoResult.withError(encodedPayloads.error!);
      }

      payloadArray = encodedPayloads.value!;
    }

    if (this.stage === 0x02 || this.stage === 0x03) {
      const encodedSignatures = new XyoSingleTypeArrayShort(
        XyoSignatureSet.creator.major,
        XyoSignatureSet.creator.minor,
        this.signatureToSend
      ).unTyped;

      if (encodedSignatures.hasError()) {
        return XyoResult.withError(encodedSignatures.error!);
      }

      signatureArray = encodedSignatures.value!;
    }

    const notNullValues = [
      keySetArray,
      payloadArray,
      signatureArray
    ].filter(item => item !== null) as Buffer[];

    return XyoResult.withValue(Buffer.concat([
      Buffer.from([this.stage]),
      ...notNullValues
    ]));
  }
}
