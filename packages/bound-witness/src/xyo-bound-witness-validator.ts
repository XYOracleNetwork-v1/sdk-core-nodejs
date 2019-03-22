/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:10:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-validator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 14th February 2019 2:01:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from "@xyo-network/errors"
import { IXyoHash } from "@xyo-network/hashing"
import { IXyoBoundWitness } from "./@types"
import { IXyoSignature } from "@xyo-network/signing"
import { XyoBase } from "@xyo-network/base"
import { schema } from "@xyo-network/serialization-schema"
import { XyoSerializationService } from "@xyo-network/serialization"

export class XyoBoundWitnessValidator extends XyoBase {

  private options: IXyoBoundWitnessValidationOptions

  constructor(options?: IXyoBoundWitnessValidationOptions) {
    super()
    this.options = options || {
      checkPartyLengths: true,
      checkIndexExists: true,
      checkCountOfSignaturesMatchPublicKeysCount: true,
      validateSignatures: true,
      validateHash: true
    }
  }

  public setValidationOptions(validationOptions: IXyoBoundWitnessValidationOptions) {
    this.options = validationOptions
  }

  public async validateBoundWitness(hash: IXyoHash, originBlock: IXyoBoundWitness): Promise<void> {

    const signaturesLength = originBlock.signatures.length
    const heuristicsLength = originBlock.heuristics.length
    const metadataLength = originBlock.metadata.length
    const keysLength = originBlock.publicKeys.length
    const signingData = originBlock.getSigningData()

    if (this.options.validateHash) {
      const validates = await hash.verifyHash(signingData)
      if (!validates) {
        throw new XyoError(`Hash does not match signing data`, XyoErrors.INVALID_PARAMETERS)
      }
    }

    if (
      this.options.checkPartyLengths &&
      (
        signaturesLength < 1 ||
        signaturesLength !== heuristicsLength ||
        signaturesLength !== metadataLength ||
        signaturesLength !== keysLength
      )
    ) {
      throw new XyoError(`Party fields mismatch`, XyoErrors.INVALID_PARAMETERS)
    }

    if (this.options.checkIndexExists) {
      originBlock.heuristics.forEach((heuristics, currentIndex) => {
        const index = heuristics.find(heuristic => heuristic.schemaObjectId === schema.index.id)
        if (index === undefined) {
          throw new XyoError(
            `Each Party must have an index in their signed payload. Failed at index ${currentIndex}`,
            XyoErrors.INVALID_PARAMETERS
          )
        }
      })
    }

    await originBlock.signatures.reduce(async (promiseChain, signatureSet, outerIndex) => {
      await promiseChain
      if (
        this.options.checkCountOfSignaturesMatchPublicKeysCount &&
        signatureSet.signatures.length !== originBlock.publicKeys[outerIndex].keys.length
      ) {
        throw new XyoError(`There was a mismatch in keys and signatures length`, XyoErrors.INVALID_PARAMETERS)
      }

      if (!this.options.validateSignatures) {
        return
      }

      return signatureSet.signatures.reduce(async (innerPromiseChain, innerSignature, innerIndex) => {
        await innerPromiseChain
        const validates = await (innerSignature as IXyoSignature).verify(
          signingData,
          originBlock.publicKeys[outerIndex].keys[innerIndex]
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

export interface IXyoBoundWitnessValidationOptions {
  checkPartyLengths: boolean,
  checkIndexExists: boolean,
  checkCountOfSignaturesMatchPublicKeysCount: boolean,
  validateSignatures: boolean,
  validateHash: boolean
}
