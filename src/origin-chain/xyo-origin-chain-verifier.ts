/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 5th October 2018 12:59:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-chain-verifier.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:53:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from "../components/bound-witness/xyo-bound-witness";
import { XyoIndex } from "../components/heuristics/numbers/xyo-index";
import { XyoObject } from "../components/xyo-object";
import { XyoPayload } from "../components/xyo-payload";
import { XyoPreviousHash } from "../components/hashing/xyo-previous-hash";
import { XyoPacker } from "../xyo-packer/xyo-packer";
import { XyoBase } from "../components/xyo-base";
import { XyoKeySet } from "../components/arrays/xyo-key-set";
import { XyoNextPublicKey } from "../signing/xyo-next-public-key";

export class XyoOriginChainVerifier extends XyoBase {

  constructor(private readonly packer: XyoPacker) {
    super();
  }

  /**
   * @param originBlocks A collection of origin blocks where the first element should
   * correspond the earliest origin block and the last element should correspond to the latest
   */

  public async verify(originBlocks: XyoBoundWitness[]): Promise<XyoOriginVerificationResult> {
    try {
      await originBlocks.reduce(async (promiseChain, originBlock, currentIndex) => {
        return this.validateBlockReducer(originBlock, await promiseChain, currentIndex === 0);
      }, Promise.resolve() as Promise<PreviousBlockInfo | undefined>);
    } catch (err) {
      this.logError(`Could not validate origin-blocks with error ${err.message}`);

      return {
        isValid: false,
        failureReason: err.message as string
      };
    }

    return {
      isValid: true
    };
  }

  private async validateBlockReducer(
    originBlock: XyoBoundWitness,
    previousBlockInfo: PreviousBlockInfo | undefined,
    isFirstBlock: boolean
  ) {
    if (!isFirstBlock && !previousBlockInfo) {
      throw new Error(`Could not put together origin chain`);
    }

    await originBlock.validateSignatures();

    const parties: PreviousBlockParty[] = [];

    const matches = await originBlock.payloads.reduce(async (matchesPromise, payload, payloadIndex) => {
      const matchesForPreviousHash = await matchesPromise;
      const publicKeySet = originBlock.publicKeys[payloadIndex];

      return this.validatePayloadReducer(
        payload,
        matchesForPreviousHash,
        parties,
        previousBlockInfo,
        publicKeySet,
        payloadIndex
      );
    }, Promise.resolve([] as number[]));

    originBlock.publicKeys.forEach((publicKeySet, index) => {
      const party = parties[index];
      party.publicKeys = publicKeySet;
    });

    if (previousBlockInfo && matches.length === 0) {
      throw new Error(`Could not find a block with previous hash`);
    }

    return {
      signingData: originBlock.getSigningData(),
      parties
    };
  }

  private async validatePayloadReducer(
    payload: XyoPayload,
    matchesForPreviousHash: number[],
    parties: PreviousBlockParty[],
    previousBlockInfo: PreviousBlockInfo | undefined,
    publicKeySet: XyoKeySet,
    payloadIndex: number
  ) {
    const xyoIndex = payload.extractFromSignedPayload<XyoIndex>(XyoIndex);
    const xyoNextPublicKey = payload.extractFromSignedPayload<XyoNextPublicKey>(XyoNextPublicKey);
    this.validateIndex(payload);

    parties.push({
      index: xyoIndex,
      nextPublicKey: xyoNextPublicKey
    });

    if (!previousBlockInfo) {
      return matchesForPreviousHash;
    }

    const previousHashValidates = await this.validatePreviousHash(payload, previousBlockInfo.signingData);
    if (!previousHashValidates) {
      return matchesForPreviousHash;
    }

    const validIndexValues = previousBlockInfo.parties.map((party) => {
      return party.index!.number + 1;
    });

    const matchedIndexes = validIndexValues.reduce((possibleIndexes, possibleIndex, iteratorIndex) => {
      if (possibleIndex === xyoIndex!.number) {
        possibleIndexes.push(iteratorIndex);
      }

      return possibleIndexes;
    }, [] as number[]);

    if (matchedIndexes.length === 0) {
      return matchesForPreviousHash;
    }

    const serializedPublicKeySet = publicKeySet.array.map((pk) => {
      return this.packer.serialize(pk);
    });

    const foundMatches = matchedIndexes.filter((matchedIndex) => {
      const party = previousBlockInfo!.parties[matchedIndex];
      if (!party.nextPublicKey) {
        return true;
      }

      const rawNextPublicKey = (party.nextPublicKey as XyoNextPublicKey).publicKey;
      const serializedValue = this.packer.serialize(rawNextPublicKey);

      return serializedPublicKeySet.indexOf(serializedValue) > -1;
    });

    if (foundMatches.length > 0) {
      matchesForPreviousHash.push(payloadIndex);
    }

    return matchesForPreviousHash;
  }

  private validatePreviousHash(payload: XyoPayload, previousSigningData: Buffer) {
    const previousHash = payload.extractFromSignedPayload<XyoPreviousHash>(XyoPreviousHash);
    if (!previousHash)  {
      return false;
    }

    return previousHash.hash.verifyHash(previousSigningData);
  }

  private validateIndex(payload: XyoPayload) {
    const index = payload.extractFromSignedPayload<XyoIndex>(XyoIndex);
    if (!index) {
      throw new Error('Could not find index in payload');
    }
  }
}

interface PreviousBlockInfo {
  signingData: Buffer;
  parties: PreviousBlockParty[];
}

interface PreviousBlockParty { // block-party lol
  index?: XyoIndex;
  publicKeys?: XyoKeySet;
  nextPublicKey?: XyoObject;
  isAssigned?: boolean;
}

export interface XyoOriginVerificationResult {
  isValid: boolean;
  failureReason?: string;
}
