/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:14:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 9:40:21 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoSerializer } from '../../xyo-serialization/xyo-serializer';
import { XyoBoundWitness } from './xyo-bound-witness';
import { XyoPayload } from '../components/payload/xyo-payload';
import { XyoSignatureSet } from '../components/signature-set/xyo-signature-set';
import { XyoError } from '../../xyo-core-components/xyo-error';
import { XyoKeySet } from '../components/key-set/xyo-key-set';
import { XyoPacker } from '../../xyo-serialization/xyo-packer';
import { XyoSingleTypeArrayShort } from '../../xyo-core-components/arrays/single/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../../xyo-core-components/arrays/single/xyo-single-type-array-int';

/**
 * A serializer for BoundWitness objects
 */
export class XyoBoundWitnessSerializer extends XyoSerializer<XyoBoundWitness> {

  get description () {
    return {
      major: XyoBoundWitness.major,
      minor: XyoBoundWitness.minor,
      sizeOfBytesToGetSize: 4,
      sizeIdentifierSize: 4
    };
  }

  /**
   * Get the byte representation of an XyoBoundWitness
   */
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

  /**
   * Given the byte representation of a bound-witness and a packing scheme,
   * return the object representation of the XyoBoundWitness
   */
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
    // Read the keyset size
    const keySetArraySizeValue = xyoPacker.getSerializerByDescriptor(
      XyoSingleTypeArrayShort
    )
    .readSize(buffer.slice(4, 4 + shortArrayReadSize), xyoPacker);

    // Extract the value bytes for the keyset
    const keySetsValue = this.getKeySetsArray(buffer.slice(4, 4 + keySetArraySizeValue), xyoPacker);

    // Read the payloads size
    const payloadArraySizeValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayInt).readSize(
      buffer.slice(keySetArraySizeValue + 4, keySetArraySizeValue + 4 + intArrayReadSize), xyoPacker
    );

    // Extract out the bytes for the payload value
    const payloadsValue = this.getPayloadsArray(
      buffer.slice(keySetArraySizeValue + 4, keySetArraySizeValue + 4 + payloadArraySizeValue),
      xyoPacker
    );

    // Read the signature size
    const signatureArraySizeValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayShort).readSize(
      buffer.slice(
        keySetArraySizeValue + payloadArraySizeValue + 4,
        keySetArraySizeValue + payloadArraySizeValue + 4 + shortArrayReadSize
      ), xyoPacker
    );

    //  Extract out the bytes for the signature value
    const signaturesValue = this.getSignatureArray(
      buffer.slice(
        keySetArraySizeValue + payloadArraySizeValue + 4,
        keySetArraySizeValue + payloadArraySizeValue + 4 + signatureArraySizeValue
      ), xyoPacker
    );

    // Given the keyset, payloads and signatures, create an XyoBoundWitness
    return this.unpackFromArrays(keySetsValue, payloadsValue, signaturesValue, xyoPacker);
  }

  /** A helper function to build an XyoBoundWitness from its component parts */
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

  /** Extract the signatures from the buffer */
  private getSignatureArray(bytes: Buffer, xyoPacker: XyoPacker): XyoSignatureSet[] {
    const signatureArrayValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayShort)
      .deserialize(bytes, xyoPacker);

    if (signatureArrayValue !== null) {
      return signatureArrayValue.array as XyoSignatureSet[];
    }

    throw new XyoError('Unknown read signature arrays Error', XyoError.errorType.ERR_CREATOR_MAPPING);
  }

  /** Extract the payloads from the buffer */
  private getPayloadsArray(bytes: Buffer, xyoPacker: XyoPacker): XyoPayload[] {
    const payloadArrayValue = xyoPacker.getSerializerByDescriptor(XyoSingleTypeArrayInt).deserialize(bytes, xyoPacker);

    if (payloadArrayValue !== null) {
      return payloadArrayValue.array as XyoPayload[];
    }

    throw new XyoError('Unknown read payloads Error', XyoError.errorType.ERR_CREATOR_MAPPING);
  }

  /** Extract the keyset from the buffer */
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
