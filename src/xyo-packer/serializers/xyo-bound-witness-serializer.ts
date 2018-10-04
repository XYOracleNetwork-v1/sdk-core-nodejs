/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:14:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:30:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoSerializer } from '../xyo-serializer';
import { XyoBoundWitness } from '../../components/bound-witness/xyo-bound-witness';
import { XyoPayload } from '../../components/xyo-payload';
import { XyoSignatureSet } from '../../components/arrays/xyo-signature-set';
import { XyoError } from '../../components/xyo-error';
import { XyoKeySet } from '../../components/arrays/xyo-key-set';
import { XyoPacker } from '../xyo-packer';
import { XyoSingleTypeArrayShort } from '../../components/arrays/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../../components/arrays/xyo-single-type-array-int';

export class XyoBoundWitnessSerializer extends XyoSerializer<XyoBoundWitness> {

  get description () {
    return {
      major: XyoBoundWitness.major,
      minor: XyoBoundWitness.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  public serialize(boundWitness: XyoBoundWitness) {
    const makePublicKeysUntypedValue = boundWitness.makePublicKeysUntyped();
    const makePayloadsUntypedValue = boundWitness.makePayloadsUntyped();
    const makeSignaturesUntypedValue = boundWitness.makeSignaturesUntyped();

    return Buffer.concat([
      makePublicKeysUntypedValue,
      makePayloadsUntypedValue,
      makeSignaturesUntypedValue,
    ]);
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker): XyoBoundWitness {
    const shortArraySerializer = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayShort);
    const shortArraySizeReadSize = shortArraySerializer.sizeOfBytesToRead;

    const intArraySerializer = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayInt);
    const intArraySizeReadSize = intArraySerializer.sizeOfBytesToRead;
    return this.unpackIntoEncodedArrays(buffer, shortArraySizeReadSize, intArraySizeReadSize, xyoPacker);
  }

  private unpackIntoEncodedArrays(
    buffer: Buffer,
    shortArrayReadSize: number,
    intArrayReadSize: number,
    xyoPacker: XyoPacker
  ): XyoBoundWitness {
    const keySetArraySizeValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayShort)
      .readSize(buffer.slice(4, 4 + shortArrayReadSize), xyoPacker);

    const keySetsValue = this.getKeySetsArray(buffer.slice(4, 4 + keySetArraySizeValue), xyoPacker);

    const payloadArraySizeValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayInt).readSize(
      buffer.slice(keySetArraySizeValue + 4, keySetArraySizeValue + 4 + intArrayReadSize), xyoPacker
    );

    const payloadsValue = this.getPayloadsArray(
      buffer.slice(keySetArraySizeValue + 4, keySetArraySizeValue + 4 + payloadArraySizeValue),
      xyoPacker
    );

    const signatureArraySizeValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayShort).readSize(
      buffer.slice(
        keySetArraySizeValue + payloadArraySizeValue + 4,
        keySetArraySizeValue + payloadArraySizeValue + 4 + shortArrayReadSize
      ), xyoPacker
    );

    const signaturesValue = this.getSignatureArray(
      buffer.slice(
        keySetArraySizeValue + payloadArraySizeValue + 4,
        keySetArraySizeValue + payloadArraySizeValue + 4 + signatureArraySizeValue
      ), xyoPacker
    );

    return this.unpackFromArrays(keySetsValue, payloadsValue, signaturesValue, xyoPacker);
  }

  private unpackFromArrays(
    keysetArray: XyoKeySet[],
    payloadArray: XyoPayload[],
    signatureArray: XyoSignatureSet[],
    packer: XyoPacker,
  ) {
    return new class XyoBoundWitnessData extends XyoBoundWitness {
      constructor(
        xyoPacker: XyoPacker,
        public readonly publicKeys: XyoKeySet[],
        public readonly payloads: XyoPayload[],
        public readonly signatures: XyoSignatureSet[]
      ) {
        super(xyoPacker);
      }
    }(packer, keysetArray, payloadArray, signatureArray);
  }

  private getSignatureArray(bytes: Buffer, xyoPacker: XyoPacker): XyoSignatureSet[] {
    const signatureArrayValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayShort)
      .deserialize(bytes, xyoPacker);

    if (signatureArrayValue !== null) {
      return signatureArrayValue.array as XyoSignatureSet[];
    }

    throw new XyoError('Unknown read signature arrays Error', XyoError.errorType.ERR_CREATOR_MAPPING);
  }

  private getPayloadsArray(bytes: Buffer, xyoPacker: XyoPacker): XyoPayload[] {
    const payloadArrayValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayInt).deserialize(bytes, xyoPacker);

    if (payloadArrayValue !== null) {
      return payloadArrayValue.array as XyoPayload[];
    }

    throw new XyoError('Unknown read payloads Error', XyoError.errorType.ERR_CREATOR_MAPPING);
  }

  private getKeySetsArray(buffer: Buffer, xyoPacker: XyoPacker): XyoKeySet[] {
    const keySetArrayValue = xyoPacker.getSerializerByDescriptor(
      XyoSingleTypeArrayShort
    ).deserialize(buffer, xyoPacker);

    if (keySetArrayValue !== null) {
      return keySetArrayValue.array as XyoKeySet[];
    }

    throw new XyoError('Unknown read keySets Error', XyoError.errorType.ERR_CREATOR_MAPPING);
  }
}
