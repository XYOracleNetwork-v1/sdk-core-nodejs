/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 11:37:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 3:43:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoKeySet } from '../arrays/multi/xyo-key-set';
import { XyoPayload } from '../xyo-payload';
import { XyoSignatureSet } from '../arrays/multi/xyo-signature-set';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoResult } from '../xyo-result';
import { XyoSingleTypeArrayShort } from '../arrays/single/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../arrays/single/xyo-single-type-array-int';
import { XyoError } from '../xyo-error';

export class XyoBoundWitnessObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x02;
  }

  get minor () {
    return 0x01;
  }

  get sizeOfBytesToGetSize () {
    return XyoResult.withValue(4);
  }

  public readSize(buffer: Buffer): XyoResult<number | null> {
    return XyoResult.withValue(buffer.readUInt32BE(0));
  }

  public createFromPacked(buffer: Buffer) {
    const shortArraySizeReadSize = XyoSingleTypeArrayShort.creator.sizeOfBytesToGetSize;
    if (shortArraySizeReadSize.hasError()) {
      return XyoResult.withError(shortArraySizeReadSize.error!) as XyoResult<XyoObject>;
    }

    const intArrayReadSize = XyoSingleTypeArrayInt.creator.sizeOfBytesToGetSize;
    if (intArrayReadSize.hasError()) {
      return XyoResult.withError(intArrayReadSize.error!) as XyoResult<XyoObject>;
    }

    return this.unpackIntoEncodedArrays(buffer, shortArraySizeReadSize.value!, intArrayReadSize.value!);
  }

  private unpackIntoEncodedArrays(
    buffer: Buffer,
    shortArrayReadSize: number,
    intArrayReadSize: number
  ): XyoResult<XyoObject> {
    const keySetArraySize = XyoSingleTypeArrayShort.creator.readSize(Buffer.from(buffer, 4, shortArrayReadSize));
    if (keySetArraySize.hasError()) {
      return XyoResult.withError(keySetArraySize.error!);
    }

    const keySetArraySizeValue = keySetArraySize.value!;
    const keySets = this.getKeySetsArray(Buffer.from(buffer, 4, keySetArraySizeValue));

    if (keySets.hasError()) {
      return XyoResult.withError(keySets.error!);
    }

    const keySetsValue = keySets.value!;

    const payloadArraySize = XyoSingleTypeArrayInt.creator.readSize(
      Buffer.from(buffer, keySetArraySizeValue + 4, intArrayReadSize)
    );

    if (payloadArraySize.hasError()) {
      return XyoResult.withError(payloadArraySize.error!);
    }

    const payloadArraySizeValue = payloadArraySize.value!;

    const payloads = this.getPayloadsArray(Buffer.from(buffer, keySetArraySizeValue + 4, payloadArraySizeValue));
    const payloadsValue = payloads.value!;

    const signatureArraySize = XyoSingleTypeArrayShort.creator.readSize(
      Buffer.from(buffer, keySetArraySizeValue + payloadArraySizeValue + 4, shortArrayReadSize)
    );

    if (signatureArraySize.hasError()) {
      return XyoResult.withError(signatureArraySize.error!);
    }

    const signatureArraySizeValue = signatureArraySize.value!;
    const signatures = this.getSignatureArray(
      Buffer.from(buffer, keySetArraySizeValue + payloadArraySizeValue + 4, signatureArraySizeValue)
    );

    const signaturesValue = signatures.value!;

    return this.unpackFromArrays(keySetsValue, payloadsValue, signaturesValue);
  }

  private unpackFromArrays(
    keysets: XyoKeySet[],
    payloads: XyoPayload[],
    signatures: XyoSignatureSet[]
  ) {
    return XyoResult.withValue(new XyoBoundWitness(keysets, payloads, signatures));
  }

  private getSignatureArray(bytes: Buffer): XyoResult<XyoSignatureSet[]> {
    const signatureArray = XyoSingleTypeArrayShort.creator.createFromPacked(bytes);
    const signatureArrayValue = signatureArray.value as XyoSingleTypeArrayShort;

    if (signatureArrayValue !== null && !signatureArray.hasError()) {
      return XyoResult.withValue(signatureArrayValue.array as XyoSignatureSet[]);
    }

    return XyoResult.withError(
      signatureArray.error ||
      new XyoError('Unknown read signature arrays Error', XyoError.errorType.ERR_CREATOR_MAPPING)
    );
  }

  private getPayloadsArray(bytes: Buffer): XyoResult<XyoPayload[]> {
    const payloadArray = XyoSingleTypeArrayInt.creator.createFromPacked(bytes);
    const payloadArrayValue = payloadArray.value as XyoSingleTypeArrayInt;

    if (payloadArrayValue !== null && !payloadArray.hasError()) {
      return XyoResult.withValue(payloadArrayValue.array as XyoPayload[]);
    }

    return XyoResult.withError(
      payloadArray.error ||
      new XyoError('Unknown read payloads Error', XyoError.errorType.ERR_CREATOR_MAPPING)
    );
  }

  private getKeySetsArray(buffer: Buffer): XyoResult<XyoKeySet[]> {
    const keySetArray = XyoSingleTypeArrayShort.creator.createFromPacked(buffer);
    const keySetArrayValue = keySetArray.value as XyoSingleTypeArrayShort;

    if (keySetArrayValue !== null && !keySetArray.hasError()) {
      return XyoResult.withValue(keySetArrayValue.array as XyoKeySet[]);
    }

    return XyoResult.withError(
      keySetArray.error ||
      new XyoError('Unknown read keySets Error', XyoError.errorType.ERR_CREATOR_MAPPING)
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoBoundWitness extends XyoObject {
  private static creator = new XyoBoundWitnessObjectCreator();

  constructor(
    public readonly publicKeys: XyoKeySet[],
    public readonly payloads: XyoPayload[],
    public readonly signatures: XyoSignatureSet[]
  ) {
    super();
  }

  get id () {
    return XyoBoundWitness.creator.id;
  }

  get data () {
    return this.makeBoundWitness();
  }

  get sizeIdentifierSize () {
    return XyoBoundWitness.creator.sizeOfBytesToGetSize;
  }

  private makeBoundWitness(): XyoResult<Buffer> {
    const makePublicKeysUntyped = this.makePublicKeys().unTyped;
    const makeSignaturesUntyped = this.makeSignatures().unTyped;
    const makePayloadsUntyped = this.makePayloads().unTyped;

    if (makePublicKeysUntyped.hasError()) {
      return XyoResult.withError(makePublicKeysUntyped.error!);
    }

    if (makeSignaturesUntyped.hasError()) {
      return XyoResult.withError(makeSignaturesUntyped.error!);
    }

    if (makePayloadsUntyped.hasError()) {
      return XyoResult.withError(makePayloadsUntyped.error!);
    }

    const makePublicKeysUntypedValue = makePublicKeysUntyped.value!;
    const makeSignaturesUntypedValue = makeSignaturesUntyped.value!;
    const makePayloadsUntypedValue = makePayloadsUntyped.value!;

    return XyoResult.withValue(Buffer.concat([
      makePublicKeysUntypedValue,
      makeSignaturesUntypedValue,
      makePayloadsUntypedValue
    ]));
  }

  private makePublicKeys(): XyoSingleTypeArrayShort {
    return new XyoSingleTypeArrayShort(
      XyoKeySet.creator.major,
      XyoKeySet.creator.minor,
      this.publicKeys
    );
  }

  private makeSignatures(): XyoSingleTypeArrayShort {
    return new XyoSingleTypeArrayShort(
      XyoSignatureSet.creator.major,
      XyoSignatureSet.creator.minor,
      this.signatures
    );
  }

  private makePayloads(): XyoSingleTypeArrayInt {
    return new XyoSingleTypeArrayInt(
      XyoPayload.creator.major,
      XyoPayload.creator.minor,
      this.payloads
    );
  }
}
