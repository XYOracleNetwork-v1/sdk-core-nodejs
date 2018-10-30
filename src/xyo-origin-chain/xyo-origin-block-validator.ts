/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 29th October 2018 4:55:59 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-block-validator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 29th October 2018 5:24:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from "../xyo-core-components/xyo-error";
import { XyoHash } from "../xyo-hashing/xyo-hash";
import { XyoBoundWitness } from "../xyo-bound-witness/bound-witness/xyo-bound-witness";
import { XyoIndex } from "../xyo-bound-witness/components/index/xyo-index";
import { IXyoSignature } from "../@types/xyo-signing";
import { XyoBase } from "../xyo-core-components/xyo-base";

export class XyoOriginBlockValidator extends XyoBase {

  constructor(private readonly options: {
    checkPartyLengths: boolean,
    checkIndexExists: boolean,
    checkCountOfSignaturesMatchPublicKeysCount: boolean,
    validateSignatures: boolean,
    validateHash: boolean
  }) {
    super();
  }

  public async validateOriginBlock(hash: XyoHash, originBlock: XyoBoundWitness): Promise<void> {
    const signaturesLength = originBlock.signatures.length;
    const payloadsLength = originBlock.payloads.length;
    const keysLength = originBlock.publicKeys.length;

    if (this.options.validateHash) {
      const validates = await hash.verifyHash(originBlock.getSigningData());
      if (!validates) {
        throw new XyoError(`Hash does not match signing data`, XyoErrors.INVALID_PARAMETERS);
      }
    }

    if (
      this.options.checkPartyLengths &&
      (signaturesLength < 1 || (signaturesLength !== payloadsLength) || signaturesLength !== keysLength)
    ) {
      throw new XyoError(`Party fields mismatch`, XyoErrors.INVALID_PARAMETERS);
    }

    if (this.options.checkIndexExists) {
      originBlock.payloads.forEach((payload, currentIndex) => {
        const index = payload.extractFromSignedPayload<XyoIndex>(XyoIndex);
        if (!index) {
          throw new XyoError(`Each Party must have an index in their signed payload`, XyoErrors.INVALID_PARAMETERS);
        }
      });
    }

    const signingData = originBlock.getSigningData();

    await originBlock.signatures.reduce(async (promiseChain, signatureSet, outerIndex) => {
      await promiseChain;
      if (
        this.options.checkCountOfSignaturesMatchPublicKeysCount &&
        signatureSet.array.length !== originBlock.publicKeys[outerIndex].array.length
      ) {
        throw new XyoError(`There was a mismatch in keys and signatures length`, XyoErrors.INVALID_PARAMETERS);
      }

      if (!this.options.validateSignatures) {
        return;
      }

      return signatureSet.array.reduce(async (innerPromiseChain, innerSignature, innerIndex) => {
        await innerPromiseChain;
        const validates = await (innerSignature as IXyoSignature).verify(
          signingData,
          originBlock.publicKeys[outerIndex].array[innerIndex]
        );

        if (!validates) {
          throw new XyoError(
            `Could not validate signature at index [${outerIndex}][${innerIndex}]`, XyoErrors.INVALID_PARAMETERS
          );
        }
      }, Promise.resolve() as Promise<void>);
    }, Promise.resolve() as Promise<void>);

    this.logInfo(`Validated OriginBlock with hash ${hash.serialize(true).toString('hex')}`);
  }
}
