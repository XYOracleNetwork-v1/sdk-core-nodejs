/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:10:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-validator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 10:23:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from "@xyo-network/errors"
import { IXyoHash } from "@xyo-network/hashing"
import { IXyoBoundWitness, IXyoBoundWitnessSigningDataProducer, IXyoPayload } from "./@types"
import { IXyoSignature } from "@xyo-network/signing"
import { XyoBase } from "@xyo-network/base"

export class XyoBoundWitnessValidator extends XyoBase {

  constructor(
    private readonly boundWitnessSigningDataProducer: IXyoBoundWitnessSigningDataProducer,
    private readonly extractIndexFromPayloadFn: (payload: IXyoPayload) => number | undefined,
    private readonly options: {
      checkPartyLengths: boolean,
      checkIndexExists: boolean,
      checkCountOfSignaturesMatchPublicKeysCount: boolean,
      validateSignatures: boolean,
      validateHash: boolean
    }) {
    super()
  }

  public async validateBoundWitness(hash: IXyoHash, originBlock: IXyoBoundWitness): Promise<void> {
    const signaturesLength = originBlock.signatures.length
    const payloadsLength = originBlock.payloads.length
    const keysLength = originBlock.publicKeys.length
    const signingData = this.boundWitnessSigningDataProducer.getSigningData(originBlock)

    if (this.options.validateHash) {
      const validates = await hash.verifyHash(signingData)
      if (!validates) {
        throw new XyoError(`Hash does not match signing data`, XyoErrors.INVALID_PARAMETERS)
      }
    }

    if (
      this.options.checkPartyLengths &&
      (signaturesLength < 1 || (signaturesLength !== payloadsLength) || signaturesLength !== keysLength)
    ) {
      throw new XyoError(`Party fields mismatch`, XyoErrors.INVALID_PARAMETERS)
    }

    if (this.options.checkIndexExists) {
      originBlock.payloads.forEach((payload, currentIndex) => {
        const index = this.extractIndexFromPayloadFn(payload)
        if (index === undefined) {
          throw new XyoError(`Each Party must have an index in their signed payload`, XyoErrors.INVALID_PARAMETERS)
        }
      })
    }

    await originBlock.signatures.reduce(async (promiseChain, signatureSet, outerIndex) => {
      await promiseChain
      if (
        this.options.checkCountOfSignaturesMatchPublicKeysCount &&
        signatureSet.length !== originBlock.publicKeys[outerIndex].length
      ) {
        throw new XyoError(`There was a mismatch in keys and signatures length`, XyoErrors.INVALID_PARAMETERS)
      }

      if (!this.options.validateSignatures) {
        return
      }

      return signatureSet.reduce(async (innerPromiseChain, innerSignature, innerIndex) => {
        await innerPromiseChain
        const validates = await (innerSignature as IXyoSignature).verify(
          signingData,
          originBlock.publicKeys[outerIndex][innerIndex]
        )

        if (!validates) {
          throw new XyoError(
            `Could not validate signature at index [${outerIndex}][${innerIndex}]`, XyoErrors.INVALID_PARAMETERS
          )
        }
      }, Promise.resolve() as Promise<void>)
    }, Promise.resolve() as Promise<void>)
  }
}
