/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 2:58:43 pm
 * @Email:  developer@xyfindables.com
 * @Filename: zig-zag-bound-witness.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 1:36:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../../components/bound-witness/xyo-zig-zag-bound-witness';
import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoBoundWitness } from '../../components/bound-witness/xyo-bound-witness';
import { XyoRSASha256SignerProvider } from '../../signing/xyo-rsa-sha256-signer-provider';
import { XyoPayload } from '../../components/xyo-payload';
import { XyoMultiTypeArrayInt } from '../../components/arrays/xyo-multi-type-array-int';
import { XyoRssi } from '../../components/heuristics/numbers/xyo-rssi';

describe(`ZigZagBoundWitness`, () => {

  it(`Should leave two parties with the same set of bound-witness data`, async () => {
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const { major: boundWitnessMajor, minor: boundWitnessMinor } = packer.getMajorMinor(XyoBoundWitness.name);
    const signerProvider = new XyoRSASha256SignerProvider();

    const bobSigners = [signerProvider.newInstance()];
    const aliceSigners = [signerProvider.newInstance()];

    const bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoRssi(-10)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoRssi(-5)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    const bobBoundWitness = new XyoZigZagBoundWitness(
      packer,
      bobSigners,
      bobPayload
    );

    const aliceBoundWitness = new XyoZigZagBoundWitness(
      packer,
      aliceSigners,
      alicePayload
    );

    const transfer1 = await bobBoundWitness.incomingData(undefined, false);
    const transfer2 = await aliceBoundWitness.incomingData(transfer1, true);
    const transfer3 = await bobBoundWitness.incomingData(transfer2, false);
    const transfer4 = await aliceBoundWitness.incomingData(transfer3, false);

    const bobTypedSerialized = packer.serialize(bobBoundWitness, boundWitnessMajor, boundWitnessMinor, true);
    const aliceTypedSerialized = packer.serialize(aliceBoundWitness, boundWitnessMajor, boundWitnessMinor, true);
    expect(bobTypedSerialized.equals(aliceTypedSerialized)).toBe(true);

  });
});
