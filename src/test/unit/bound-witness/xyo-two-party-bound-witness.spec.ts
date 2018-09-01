/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 4th September 2018 11:04:14 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-two-party-bound-witness.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th September 2018 11:53:51 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSigner } from '../../../components/signing/xyo-signer';
import { XyoResult } from '../../../components/xyo-result';
import { XyoObject } from '../../../components/xyo-object';
import { XyoRsaPublicKey } from '../../../components/signing/algorithms/rsa/xyo-rsa-public-key';
import NodeRSA from 'node-rsa';
import { XyoRsaSignature, XyoRsaSignatureCreator } from '../../../components/signing/algorithms/rsa/xyo-rsa-signature';
import { XyoMultiTypeArrayInt } from '../../../components/arrays/multi/xyo-multi-type-array-int';
import { XyoRssi } from '../../../components/heuristics/numbers/signed/xyo-rssi';
import { XyoPayload } from '../../../components/xyo-payload';
import { XyoZigZagBoundWitness } from '../../../components/bound-witness/xyo-zig-zag-bound-witness';
import { XyoObjectCreator } from '../../../components/xyo-object-creator';
import { XyoBoundWitness } from '../../../components/bound-witness/xyo-bound-witness';

import { loadAllTypes, assertBufferEquals } from '../../test-utils';
import { XyoBoundWitnessTransfer } from '../../../components/bound-witness/xyo-bound-witness-transfer';

class RSASha256Signature extends XyoRsaSignature {
  public static creator = new XyoRsaSignatureCreator(0x08);

  constructor(buffer: Buffer) {
    super(buffer, RSASha256Signature.creator.id.value!);
  }
}

// tslint:disable-next-line:max-classes-per-file
class RSASha256Signer extends XyoSigner {

  private readonly key = new NodeRSA({ b: 2048 });

  public async signData(data: Buffer): Promise<XyoResult<XyoObject>> {
    const sig = new RSASha256Signature(this.key.sign(data));
    const res = XyoResult.withValue(sig);
    return res;
  }

  get publicKey() {
    const modulus = this.key.exportKey('components-public').n;
    return XyoResult.withValue(new XyoRsaPublicKey(modulus));
  }
}

describe(`XyoTwoPartyBoundWitness`, () => {
  beforeAll(() => {
    loadAllTypes();
    RSASha256Signature.creator.enable();
  });

  const signersAlice = [new RSASha256Signer()];
  const signedPayloadAlice = new XyoMultiTypeArrayInt([new XyoRssi(5)]);
  const unsignedPayloadAlice = new XyoMultiTypeArrayInt([new XyoRssi(5)]);

  const signersBob = [new RSASha256Signer()];
  const signedPayloadBob = new XyoMultiTypeArrayInt([new XyoRssi(10)]);
  const unsignedPayloadBob = new XyoMultiTypeArrayInt([new XyoRssi(10)]);

  it(`Should create a bound witness between two parties`, async () => {
    const payloadAlice = new XyoPayload(signedPayloadAlice, unsignedPayloadAlice);
    const payloadBob = new XyoPayload(signedPayloadBob, unsignedPayloadBob);
    const boundWitnessAlice = new XyoZigZagBoundWitness(signersAlice, payloadAlice);
    const boundWitnessBob = new XyoZigZagBoundWitness(signersBob, payloadBob);

    const aliceToBobOne = await boundWitnessAlice.incomingData(null, false);
    const bobToAliceOne = await boundWitnessBob.incomingData(aliceToBobOne.value!, true);
    const aliceToBobTwo = await boundWitnessAlice.incomingData(bobToAliceOne.value!, false);

    await boundWitnessBob.incomingData(aliceToBobTwo.value!, false);
    const aliceData = boundWitnessAlice.data.value!;
    const bobData = boundWitnessBob.data.value!;
    expect(aliceData.equals(bobData)).toBe(true);

    const bytes = boundWitnessAlice.typed.value!;
    const serialized = XyoObjectCreator.create(bytes);
    const deserialized = (serialized.value as XyoBoundWitness).data.value!;
    expect(boundWitnessAlice.data.value!.equals(deserialized));
  });

  it(`Should be able to deserialize a bound witness transfer`, async () => {
    const payloadAlice = new XyoPayload(signedPayloadAlice, unsignedPayloadAlice);
    const payloadBob = new XyoPayload(signedPayloadBob, unsignedPayloadBob);
    const boundWitnessAlice = new XyoZigZagBoundWitness(signersAlice, payloadAlice);
    const boundWitnessBob = new XyoZigZagBoundWitness(signersBob, payloadBob);

    const aliceToBobOne = await boundWitnessAlice.incomingData(null, false);
    const aliceToBobOneBytes = aliceToBobOne.value!.typed.value!;
    const aliceToBobOneBytesSerialized = XyoObjectCreator.create(aliceToBobOneBytes);
    const aliceToBobOneDeserialized = (aliceToBobOneBytesSerialized.value as XyoBoundWitnessTransfer).data.value!;
    assertBufferEquals(aliceToBobOne.value!.data.value!, aliceToBobOneDeserialized);

    const bobToAliceOne = await boundWitnessBob.incomingData(aliceToBobOne.value!, true);
    const bobToAliceOneBytes = bobToAliceOne.value!.typed.value!;
    const bobToAliceOneBytesSerialized = XyoObjectCreator.create(bobToAliceOneBytes);
    const bobToAliceOneDeserialized = (bobToAliceOneBytesSerialized.value as XyoBoundWitnessTransfer).data.value!;
    assertBufferEquals(bobToAliceOne.value!.data.value!, bobToAliceOneDeserialized);

    const aliceToBobTwo = await boundWitnessAlice.incomingData(bobToAliceOne.value!, false);
    const aliceToBobTwoBytes = aliceToBobTwo.value!.typed.value!;
    const aliceToBobTwoBytesSerialized = XyoObjectCreator.create(aliceToBobTwoBytes);
    const aliceToBobTwoDeserialized = (aliceToBobTwoBytesSerialized.value as XyoBoundWitnessTransfer).data.value!;
    assertBufferEquals(aliceToBobTwo.value!.data.value!, aliceToBobTwoDeserialized);

    const bobToAliceTwo = await boundWitnessBob.incomingData(aliceToBobTwo.value!, false);
    const bobToAliceTwoBytes = bobToAliceTwo.value!.typed.value!;
    const bobToAliceTwoBytesSerialized = XyoObjectCreator.create(bobToAliceTwoBytes);
    const bobToAliceTwoDeserialized = (bobToAliceTwoBytesSerialized.value as XyoBoundWitnessTransfer).data.value!;
    assertBufferEquals(bobToAliceTwo.value!.data.value!, bobToAliceTwoDeserialized);

    const aliceData = boundWitnessAlice.data.value!;
    const bobData = boundWitnessBob.data.value!;
    assertBufferEquals(aliceData, bobData);

    const bytes = boundWitnessAlice.typed.value!;
    const serialized = XyoObjectCreator.create(bytes);
    const deserialized = (serialized.value as XyoBoundWitness).data.value!;
    assertBufferEquals(boundWitnessAlice.data.value!, deserialized);
  });
});
