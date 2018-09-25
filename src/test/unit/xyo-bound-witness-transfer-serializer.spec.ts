/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st September 2018 11:18:27 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash-serializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 1:52:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDefaultPackerProvider } from '../../xyo-packer/xyo-default-packer-provider';
import { XyoBoundWitnessTransfer } from '../../components/bound-witness/xyo-bound-witness-transfer';
import { XyoMultiTypeArrayInt } from '../../components/arrays/xyo-multi-type-array-int';
import { XyoSha256HashProvider } from '../../hash-provider/xyo-sha256-hash-provider';
import { XyoHash } from '../../components/hashing/xyo-hash';
import { XyoPreviousHash } from '../../components/hashing/xyo-previous-hash';
import { XyoPayload } from '../../components/xyo-payload';
import { XyoIndex } from '../../components/heuristics/numbers/xyo-index';

describe('XyoBoundWitnessTransferSerializer', () => {
  it(`Should serialize and deserialize`, () => {
    // const hash = Buffer.from('bddf6066cbf33755698c43022069f20f3574f1bdfcef684d943adbdad5a50205', 'hex');
    // const hashProvider = new XyoSha256HashProvider();
    // const xyoHash = new XyoHash(hashProvider, hash, 0x03, 0x05);
    // const xyoPreviousHash = new XyoPreviousHash(xyoHash);

    // const index = new XyoIndex(1);
    // const xyoPreviousHashArray = [xyoPreviousHash, index];
    // const signedPayload = new XyoMultiTypeArrayInt(xyoPreviousHashArray);

    // const payload = new XyoPayload(
    //   signedPayload,
    //   new XyoMultiTypeArrayInt([])
    // );

    // const packer = new XyoDefaultPackerProvider().getXyoPacker();
    // const serialized = packer.serialize(
    //   payload,
    //   payload.major,
    //   payload.minor,
    //   true
    // );

    // packer.deserialize(serialized);

    // tslint:disable-next-line:max-line-length
    const boundWitnessTransferHex = '0000014a01010b020201070403010300aa9ea7e269e0d2c30810e7386b4b6058240b437820bbf27d584199727b813bd08e4caf4c997b03b6b77d6ecc2cdd79d663540c614802f1d31f3416fd4150a4363f43ab17c21eb04126ca2505ac6da4fdda3582045b4b8bbd9c0a8dd24e256e63006826fc086273dd003992584fd0d8b30004988e30504a09356a652dc815c59f0849a32508526ed63f300d09e6e4e3ca285f1a6e7d84cf8890a984acdcab2a8d80a1f2001c7febbc7eb4a1fefe5f701fa13e51ecc37ce7156f6153476554bdefe15baa09671d3a3e1e470c9f178f776b419ae273e172d2bfe099ea27794fb6b0922a94dc18968ff80deeb3607ab5df915cce7000c678a36c73eb51fd8d51ac330000003a0204000000340000002c020603056c69bbcd68520db4e8ac2545c4afa661bc4d8ea82c8bda297aa5ffe311b602050000000100000004';
    const packer = new XyoDefaultPackerProvider().getXyoPacker();
    const boundWitnessTransferBuffer = Buffer.from(boundWitnessTransferHex, 'hex');
    const serializer = packer.getSerializerByName(XyoBoundWitnessTransfer.name);
    serializer!.deserialize(boundWitnessTransferBuffer, packer);
  });
});
