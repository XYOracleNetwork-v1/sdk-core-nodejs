/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 1:36:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th September 2018 11:18:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRssi } from '../components/heuristics/numbers/signed/xyo-rssi';
import { XyoMd5 } from '../components/hashing/xyo-md5';
import { XyoSha1 } from '../components/hashing/xyo-sha1';
import { XyoSha224 } from '../components/hashing/xyo-sha224';
import { XyoSha256 } from '../components/hashing/xyo-sha256';
import { XyoSha384 } from '../components/hashing/xyo-sha384';
import { XyoSha512 } from '../components/hashing/xyo-sha512';
import { XyoKeySet } from '../components/arrays/multi/xyo-key-set';
import { XyoMultiTypeArrayByte } from '../components/arrays/multi/xyo-multi-type-array-byte';
import { XyoMultiTypeArrayInt } from '../components/arrays/multi/xyo-multi-type-array-int';
import { XyoMultiTypeArrayShort } from '../components/arrays/multi/xyo-multi-type-array-short';
import { XyoSignatureSet } from '../components/arrays/multi/xyo-signature-set';
import { XyoSingleTypeArrayByte } from '../components/arrays/single/xyo-single-type-array-byte';
import { XyoSingleTypeArrayInt } from '../components/arrays/single/xyo-single-type-array-int';
import { XyoSingleTypeArrayShort } from '../components/arrays/single/xyo-single-type-array-short';
import { XyoBoundWitnessTransfer } from '../components/bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoPreviousHash } from '../components/hashing/xyo-previous-hash';
import { XyoIndex } from '../components/heuristics/numbers/unsigned/xyo-index';
import { XyoSecp256K1CompressedPublicKey } from '../components/signing/algorithms/ecc/xyo-secp256k1-compressed-public-key';
import { XyoRsaPublicKey } from '../components/signing/algorithms/rsa/xyo-rsa-public-key';
import { XyoPayload } from '../components/xyo-payload';
import { XyoResult } from '../components/xyo-result';

XyoResult.defaultStrictValue = false;

export function loadAllTypes() {
  XyoRssi.creator.enable();
  XyoIndex.creator.enable();
  XyoPayload.creator.enable();

  XyoMd5.creator.enable();
  XyoSha1.creator.enable();
  XyoSha224.creator.enable();
  XyoSha256.creator.enable();
  XyoSha384.creator.enable();
  XyoSha512.creator.enable();

  XyoPreviousHash.creator.enable();

  XyoKeySet.creator.enable();
  XyoMultiTypeArrayByte.creator.enable();
  XyoMultiTypeArrayInt.creator.enable();
  XyoMultiTypeArrayShort.creator.enable();
  XyoSignatureSet.creator.enable();

  XyoSecp256K1CompressedPublicKey.creator.enable();
  XyoRsaPublicKey.creator.enable();

  XyoSingleTypeArrayByte.creator.enable();
  XyoSingleTypeArrayInt.creator.enable();
  XyoSingleTypeArrayShort.creator.enable();

  XyoBoundWitnessTransfer.creator.enable();
  XyoBoundWitness.creator.enable();
}

export function assertBufferEquals(bufferA: Buffer, bufferB: Buffer) {
  if (bufferA === bufferB) {
    return true;
  }

  if (bufferA && !bufferB) {
    throw new Error(`Buffer A is defined, Buffer B is not`);
  }

  if (bufferB && !bufferA) {
    throw new Error(`Buffer B is defined, Buffer A is not`);
  }

  if (bufferA.length !== bufferB.length) {
    throw new Error(`Buffer A length ${bufferA.length}, Buffer B length ${bufferB.length}`);
  }

  for (let i = 0; i < bufferA.length; i += 1) {
    if (bufferA[i] !== bufferB[i]) {
      throw new Error(`Buffers differ at index ${i},
        Buffer A: ${bufferA[i]}
        Buffer B: ${bufferB[i]}
      `);
    }
  }
}
