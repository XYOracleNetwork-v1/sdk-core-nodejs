/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 11th October 2018 2:36:42 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:19:59 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessSerializer } from '../bound-witness/xyo-bound-witness-serializer';
import { XyoBoundWitness } from '../bound-witness/xyo-bound-witness';
import { XyoKeySet } from '../components/key-set/xyo-key-set';
import { XyoPayload } from '../components/payload/xyo-payload';
import { XyoSignatureSet } from '../components/signature-set/xyo-signature-set';
import { XyoMultiTypeArrayInt } from '../../xyo-core-components/arrays/multi/xyo-multi-type-array-int';
import { XyoDefaultPackerProvider } from '../../xyo-serialization/xyo-default-packer-provider';
import { XyoPacker } from '../../xyo-serialization/xyo-packer';
import { XyoRsaPublicKey } from '../../xyo-signing/rsa/public-key/xyo-rsa-public-key';
import { XyoRssi } from '../../xyo-core-components/heuristics/numbers/xyo-rssi';
import { XyoRsaSha256Signature } from '../../xyo-signing/rsa/sha256/xyo-rsa-sha256-signature';
import { XyoObject } from '../../xyo-core-components/xyo-object';
import { IXyoPayload } from '../../@types/xyo-node';

XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();

describe(XyoBoundWitnessSerializer.name, () => {
  describe(`Should serialize and deserialize into the same value`, () => {

    it(`With empty public-keys, payloads, and signatures`, () => {

      const publicKeys = [new XyoKeySet([])];
      const payloads = [new XyoPayload(
        new XyoMultiTypeArrayInt([]),
        new XyoMultiTypeArrayInt([])
      )];

      const signatures = [new XyoSignatureSet([])];

      const bw = new XyoTestBoundWitness(publicKeys, payloads, signatures);
      const serialized = bw.serialize(true);
      const deserialized: XyoBoundWitness = XyoObject.deserialize(serialized);

      expect(bw.payloads.length).toBe(deserialized.payloads.length);
      expect(bw.publicKeys.length).toBe(deserialized.publicKeys.length);
      expect(bw.signatures.length).toBe(deserialized.signatures.length);
    });

    it(`With values for public-keys, payloads, and signatures`, () => {

      const rawPublicKey1 = Buffer.from('hello');
      const rawPublicKey2 = Buffer.from('world');

      const publicKey1 = new XyoRsaPublicKey(rawPublicKey1);
      const publicKey2 = new XyoRsaPublicKey(rawPublicKey2);

      const rawSig1 = Buffer.from("dummy sig 1");
      const rawSig2 = Buffer.from("dummy sig 2");

      const publicKeys = [
        new XyoKeySet([publicKey1]),
        new XyoKeySet([publicKey2])
      ];

      const payloads = [new XyoPayload(
        new XyoMultiTypeArrayInt([new XyoRssi(-10)]),
        new XyoMultiTypeArrayInt([new XyoRssi(-20)])
      )];

      const signatures = [new XyoSignatureSet([
        new XyoRsaSha256Signature(
          rawSig1,
          async () => true
        )]),
        new XyoSignatureSet([
          new XyoRsaSha256Signature(
            rawSig2,
            async () => true
          )
        ])
      ];

      const bw = new XyoTestBoundWitness(publicKeys, payloads, signatures);
      const serialized = bw.serialize(true);
      const deserialized: XyoBoundWitness = XyoObject.deserialize(serialized);

      expect(bw.payloads.length).toBe(1);
      expect(bw.payloads.length).toBe(deserialized.payloads.length);

      expect(bw.publicKeys.length).toBe(2);
      expect(bw.publicKeys.length).toBe(deserialized.publicKeys.length);

      expect(bw.signatures.length).toBe(2);
      expect(bw.signatures.length).toBe(deserialized.signatures.length);

      expect((deserialized.payloads[0].signedPayload.array[0] as XyoRssi).number).toBe(-10);
      expect((deserialized.payloads[0].unsignedPayload.array[0] as XyoRssi).number).toBe(-20);

      expect((deserialized.publicKeys[0].array[0] as XyoRsaPublicKey)
          .getRawPublicKey()
          .equals(rawPublicKey1)
      ).toBe(true);

      expect((deserialized.publicKeys[1].array[0] as XyoRsaPublicKey)
          .getRawPublicKey()
          .equals(rawPublicKey2)
      ).toBe(true);

      expect((deserialized.signatures[0].array[0] as XyoRsaSha256Signature)
        .encodedSignature
        .equals(rawSig1)
      ).toBe(true);

      expect((deserialized.signatures[1].array[0] as XyoRsaSha256Signature)
        .encodedSignature
        .equals(rawSig2)
      ).toBe(true);

      expect(deserialized.isEqual(bw)).toBe(true);
    });

  });

});

class XyoTestBoundWitness extends XyoBoundWitness {

  constructor(
    public publicKeys: XyoKeySet[],
    public payloads: IXyoPayload[],
    public signatures: XyoSignatureSet[]
  ) {
    super();
  }
}
