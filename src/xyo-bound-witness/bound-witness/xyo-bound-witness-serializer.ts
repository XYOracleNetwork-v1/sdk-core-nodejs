/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 10:14:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:18:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoSerializer } from '../../xyo-serialization/xyo-serializer';
import { XyoBoundWitness } from './xyo-bound-witness';
import { XyoPayload } from '../components/payload/xyo-payload';
import { XyoSignatureSet } from '../components/signature-set/xyo-signature-set';
import { XyoError, XyoErrors } from '../../xyo-core-components/xyo-error';
import { XyoKeySet } from '../components/key-set/xyo-key-set';
import { XyoSingleTypeArrayShort } from '../../xyo-core-components/arrays/single/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../../xyo-core-components/arrays/single/xyo-single-type-array-int';
import { IXyoPayload } from '../../@types/xyo-node';

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
  public deserialize(buffer: Buffer): XyoBoundWitness {
    const shortArraySerializer = XyoSingleTypeArrayShort.getSerializer<XyoSingleTypeArrayShort>();
    const shortArraySizeReadSize = shortArraySerializer.sizeOfBytesToRead;

    const intArraySerializer = XyoSingleTypeArrayInt.getSerializer<XyoSingleTypeArrayInt>();
    const intArraySizeReadSize = intArraySerializer.sizeOfBytesToRead;
    return this.unpackIntoEncodedArrays(buffer, shortArraySizeReadSize, intArraySizeReadSize);
  }

  private unpackIntoEncodedArrays(
    buffer: Buffer,
    shortArrayReadSize: number,
    intArrayReadSize: number
  ): XyoBoundWitness {
    // Read the keyset size
    const keySetArraySizeValue = XyoSingleTypeArrayShort
      .getSerializer<XyoSingleTypeArrayShort>()
      .readSize(buffer.slice(4, 4 + shortArrayReadSize));

    // Extract the value bytes for the keyset
    const keySetsValue = this.getKeySetsArray(buffer.slice(4, 4 + keySetArraySizeValue));

    // Read the payloads size
    const payloadArraySizeValue = XyoSingleTypeArrayInt.getSerializer()
      .readSize(
        buffer.slice(keySetArraySizeValue + 4, keySetArraySizeValue + 4 + intArrayReadSize)
      );

    // Extract out the bytes for the payload value
    const payloadsValue = this.getPayloadsArray(
      buffer.slice(keySetArraySizeValue + 4, keySetArraySizeValue + 4 + payloadArraySizeValue)
    );

    // Read the signature size
    const signatureArraySizeValue = XyoSingleTypeArrayShort.getSerializer().readSize(
      buffer.slice(
        keySetArraySizeValue + payloadArraySizeValue + 4,
        keySetArraySizeValue + payloadArraySizeValue + 4 + shortArrayReadSize
      )
    );

    //  Extract out the bytes for the signature value
    const signaturesValue = this.getSignatureArray(
      buffer.slice(
        keySetArraySizeValue + payloadArraySizeValue + 4,
        keySetArraySizeValue + payloadArraySizeValue + 4 + signatureArraySizeValue
      )
    );

    // Given the keyset, payloads and signatures, create an XyoBoundWitness
    return this.unpackFromArrays(keySetsValue, payloadsValue, signaturesValue);
  }

  /** A helper function to build an XyoBoundWitness from its component parts */
  private unpackFromArrays(
    keysetArray: XyoKeySet[],
    payloadArray: IXyoPayload[],
    signatureArray: XyoSignatureSet[]
  ) {
    return new class XyoBoundWitnessData extends XyoBoundWitness {
      constructor(
        public readonly publicKeys: XyoKeySet[],
        public readonly payloads: IXyoPayload[],
        public readonly signatures: XyoSignatureSet[]
      ) {
        super();
      }
    }(keysetArray, payloadArray, signatureArray);
  }

  /** Extract the signatures from the buffer */
  private getSignatureArray(bytes: Buffer): XyoSignatureSet[] {
    const signatureArrayValue = XyoSingleTypeArrayShort.getSerializer<XyoSingleTypeArrayShort>()
      .deserialize(bytes);

    if (signatureArrayValue !== null) {
      return signatureArrayValue.array as XyoSignatureSet[];
    }

    throw new XyoError('Unknown read signature arrays Error', XyoErrors.CREATOR_MAPPING);
  }

  /** Extract the payloads from the buffer */
  private getPayloadsArray(bytes: Buffer): IXyoPayload[] {
    const payloadArrayValue = XyoSingleTypeArrayInt.getSerializer<XyoSingleTypeArrayInt>().deserialize(bytes);

    if (payloadArrayValue !== null) {
      return payloadArrayValue.array as XyoPayload[];
    }

    throw new XyoError('Unknown read payloads Error', XyoErrors.CREATOR_MAPPING);
  }

  /** Extract the keyset from the buffer */
  private getKeySetsArray(buffer: Buffer): XyoKeySet[] {
    const keySetArrayValue = XyoSingleTypeArrayShort.getSerializer<XyoSingleTypeArrayShort>().deserialize(buffer);

    if (keySetArrayValue !== null) {
      return keySetArrayValue.array as XyoKeySet[];
    }

    throw new XyoError('Unknown read keySets Error', XyoErrors.CREATOR_MAPPING);
  }
}
