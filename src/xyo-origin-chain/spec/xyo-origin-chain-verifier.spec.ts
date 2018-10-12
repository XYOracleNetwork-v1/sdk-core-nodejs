/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 8th October 2018 10:10:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-verifier.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 9:44:26 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from "../../xyo-bound-witness/bound-witness/xyo-zig-zag-bound-witness";
import { XyoDefaultPackerProvider } from "../../xyo-serialization/xyo-default-packer-provider";

import { XyoRsaSha256SignerProvider } from "../../xyo-signing/rsa/sha256/xyo-rsa-sha256-signer-provider";
import { XyoPayload } from "../../xyo-bound-witness/components/payload/xyo-payload";
import { XyoMultiTypeArrayInt } from "../../xyo-core-components/arrays/multi/xyo-multi-type-array-int";
import { XyoRssi } from "../../xyo-core-components/heuristics/numbers/xyo-rssi";
import { XyoIndex } from "../../xyo-bound-witness/components/index/xyo-index";
import { XyoOriginChainVerifier } from "../xyo-origin-chain-verifier";
import { XyoSha256HashProvider } from "../../xyo-hashing/sha256/xyo-sha256-hash-provider";
import { XyoPreviousHash } from "../../xyo-bound-witness/components/previous-hash/xyo-previous-hash";
import { XyoNextPublicKey } from "../../xyo-bound-witness/components/next-public-key/xyo-next-public-key";
import { XyoObject } from "../../xyo-core-components/xyo-object";

XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();
const signerProvider = new XyoRsaSha256SignerProvider();
const hashProvider = new XyoSha256HashProvider();

describe(`XyoOriginChainVerifier`, () => {

  it(`Should validate a single valid block with indexes`, async () => {
    const aliceSigners = [signerProvider.newInstance()];
    const bobSigners = [signerProvider.newInstance()];

    const alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    const bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness = new XyoZigZagBoundWitness(bobSigners, bobPayload);

    await doBoundWitness(aliceBoundWitness, bobBoundWitness);

    const result = await new XyoOriginChainVerifier().verify([aliceBoundWitness]);
    expect(result.isValid).toBe(true);
  });

  it(`Should invalidate a block with without indexes`, async () => {
    const aliceSigners = [signerProvider.newInstance()];
    const bobSigners = [signerProvider.newInstance()];

    const alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    const bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness = new XyoZigZagBoundWitness(bobSigners, bobPayload);

    await doBoundWitness(aliceBoundWitness, bobBoundWitness);

    const result = await new XyoOriginChainVerifier().verify([aliceBoundWitness]);
    expect(result.isValid).toBe(false);
  });

  it(`Should validate a block with valid previous hash`, async () => {
    let aliceSigners = [signerProvider.newInstance()];
    let bobSigners = [signerProvider.newInstance()];

    let alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    let  bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness1 = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness1 = new XyoZigZagBoundWitness(bobSigners, bobPayload);

    await doBoundWitness(aliceBoundWitness1, bobBoundWitness1);

    aliceSigners = [signerProvider.newInstance()];
    bobSigners = [signerProvider.newInstance()];

    const boundWitness1Hash = await aliceBoundWitness1.getHash(hashProvider);
    const boundWitness2PreviousHash = new XyoPreviousHash(boundWitness1Hash);

    alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(1), boundWitness2PreviousHash]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness2 = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness2 = new XyoZigZagBoundWitness(bobSigners, bobPayload);
    await doBoundWitness(aliceBoundWitness2, bobBoundWitness2);

    const result = await new XyoOriginChainVerifier().verify([aliceBoundWitness1, aliceBoundWitness2]);
    expect(result.isValid).toBe(true);

    const result2 = await new XyoOriginChainVerifier().verify([aliceBoundWitness2, aliceBoundWitness1]);
    expect(result2.isValid).toBe(false);
  });

  it(`Should invalidate a block with invalid index`, async () => {
    let aliceSigners = [signerProvider.newInstance()];
    let bobSigners = [signerProvider.newInstance()];

    let alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    let  bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness1 = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness1 = new XyoZigZagBoundWitness(bobSigners, bobPayload);

    await doBoundWitness(aliceBoundWitness1, bobBoundWitness1);

    aliceSigners = [signerProvider.newInstance()];
    bobSigners = [signerProvider.newInstance()];

    const boundWitness1Hash = await aliceBoundWitness1.getHash(hashProvider);
    const boundWitness2PreviousHash = new XyoPreviousHash(boundWitness1Hash);

    alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(2), boundWitness2PreviousHash]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness2 = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness2 = new XyoZigZagBoundWitness(bobSigners, bobPayload);
    await doBoundWitness(aliceBoundWitness2, bobBoundWitness2);

    const result = await new XyoOriginChainVerifier().verify([aliceBoundWitness1, aliceBoundWitness2]);
    expect(result.isValid).toBe(false);
  });

  it(`Should invalidate a block without a valid next public key`, async () => {
    let aliceSigners = [signerProvider.newInstance()];
    const aliceNextSigner = signerProvider.newInstance();
    let bobSigners = [signerProvider.newInstance()];

    const aliceNextPublicKey = new XyoNextPublicKey(aliceNextSigner.publicKey);
    let alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0), aliceNextPublicKey]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    let  bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(1)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness1 = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness1 = new XyoZigZagBoundWitness(bobSigners, bobPayload);

    await doBoundWitness(aliceBoundWitness1, bobBoundWitness1);

    aliceSigners = [signerProvider.newInstance()];
    bobSigners = [signerProvider.newInstance()];

    const boundWitness1Hash = await aliceBoundWitness1.getHash(hashProvider);
    const boundWitness2PreviousHash = new XyoPreviousHash(boundWitness1Hash);

    alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(1), boundWitness2PreviousHash]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    const fakeHash = await hashProvider.createHash(Buffer.from('hello world'));
    const fakePreviousHash = new XyoPreviousHash(fakeHash);
    bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(2), fakePreviousHash]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness2 = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness2 = new XyoZigZagBoundWitness(bobSigners, bobPayload);
    await doBoundWitness(aliceBoundWitness2, bobBoundWitness2);

    const result = await new XyoOriginChainVerifier().verify([aliceBoundWitness1, aliceBoundWitness2]);
    expect(result.isValid).toBe(false);
  });

  it(`Should validate a block with a valid next public key`, async () => {
    let aliceSigners = [signerProvider.newInstance()];
    const aliceNextSigner = signerProvider.newInstance();
    let bobSigners = [signerProvider.newInstance()];

    const aliceNextPublicKey = new XyoNextPublicKey(aliceNextSigner.publicKey);
    let alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(0), aliceNextPublicKey]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    let  bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(1)]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness1 = new XyoZigZagBoundWitness(aliceSigners, alicePayload);
    const bobBoundWitness1 = new XyoZigZagBoundWitness(bobSigners, bobPayload);

    await doBoundWitness(aliceBoundWitness1, bobBoundWitness1);

    aliceSigners = [signerProvider.newInstance()];
    bobSigners = [signerProvider.newInstance()];

    const boundWitness1Hash = await aliceBoundWitness1.getHash(hashProvider);
    const boundWitness2PreviousHash = new XyoPreviousHash(boundWitness1Hash);

    alicePayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(1), boundWitness2PreviousHash]),
      new XyoMultiTypeArrayInt([new XyoRssi(-5)])
    );

    const fakeHash = await hashProvider.createHash(Buffer.from('hello world'));
    const fakePreviousHash = new XyoPreviousHash(fakeHash);
    bobPayload = new XyoPayload(
      new XyoMultiTypeArrayInt([new XyoIndex(2), fakePreviousHash]),
      new XyoMultiTypeArrayInt([new XyoRssi(-10)])
    );

    const aliceBoundWitness2 = new XyoZigZagBoundWitness([aliceNextSigner], alicePayload);
    const bobBoundWitness2 = new XyoZigZagBoundWitness(bobSigners, bobPayload);
    await doBoundWitness(aliceBoundWitness2, bobBoundWitness2);

    const result = await new XyoOriginChainVerifier().verify([aliceBoundWitness1, aliceBoundWitness2]);
    expect(result.isValid).toBe(true);
  });
});

async function doBoundWitness(a: XyoZigZagBoundWitness, b: XyoZigZagBoundWitness) {
  const transfer1 = await a.incomingData(undefined, false);
  const transfer2 = await b.incomingData(transfer1, true);
  const transfer3 = await a.incomingData(transfer2, false);
  await b.incomingData(transfer3, false);
}
