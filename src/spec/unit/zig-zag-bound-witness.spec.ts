/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 2:58:43 pm
 * @Email:  developer@xyfindables.com
 * @Filename: zig-zag-bound-witness.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 4:48:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../../xyo-bound-witness/bound-witness/xyo-zig-zag-bound-witness';
import { XyoDefaultPackerProvider } from '../../xyo-serialization/xyo-default-packer-provider';
import { XyoRsaSha256SignerProvider } from '../../xyo-signing/rsa/sha256/xyo-rsa-sha256-signer-provider';
import { XyoPayload } from '../../xyo-bound-witness/components/payload/xyo-payload';
import { XyoMultiTypeArrayInt } from '../../xyo-core-components/arrays/multi/xyo-multi-type-array-int';
import { XyoRssi } from '../../xyo-core-components/heuristics/numbers/xyo-rssi';
import { XyoObject } from '../../xyo-core-components/xyo-object';

describe(`ZigZagBoundWitness`, () => {

  it(`Should leave two parties with the same set of bound-witness data`, async () => {
    XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();
    const signerProvider = new XyoRsaSha256SignerProvider();

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

    const bobBoundWitness = new XyoZigZagBoundWitness(bobSigners, bobPayload);

    const aliceBoundWitness = new XyoZigZagBoundWitness(aliceSigners, alicePayload);

    const transfer1 = await bobBoundWitness.incomingData(undefined, false);
    const transfer2 = await aliceBoundWitness.incomingData(transfer1, true);
    const transfer3 = await bobBoundWitness.incomingData(transfer2, false);
    const transfer4 = await aliceBoundWitness.incomingData(transfer3, false);

    const bobTypedSerialized = bobBoundWitness.serialize(true);
    const aliceTypedSerialized = aliceBoundWitness.serialize(true);
    expect(bobTypedSerialized.equals(aliceTypedSerialized)).toBe(true);

  });
});
