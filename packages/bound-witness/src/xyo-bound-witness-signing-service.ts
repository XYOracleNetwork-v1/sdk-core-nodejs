/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:14:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-signing-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 5:15:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoBoundWitnessSigningDataProducer, IXyoBoundWitness } from "./@types"
import { IXyoSigner, IXyoSignature } from "@xyo-network/signing"

export class XyoBoundWitnessSigningService extends XyoBase {

  constructor (private readonly boundWitnessSigningDataProducer: IXyoBoundWitnessSigningDataProducer) {
    super()
  }

  /**
   * Signs the signable portion of a BoundWitness, returns a signature
   *
   * @param boundWitness The bound witness to be signed
   * @param signer A signer to sign the bound-witness with
   */
  public sign(boundWitness: IXyoBoundWitness, signer: IXyoSigner): Promise<IXyoSignature> {
    return signer.signData(this.boundWitnessSigningDataProducer.getSigningData(boundWitness))
  }

  /**
   * Validates the signatures for the signed payloads of the this BoundWitness. Will throw
   * an error if a signature can't be validate
   *
   * @param {IXyoBoundWitness} boundWitness The bound-witness to verify the signatures against
   * @returns {Promise<void>}
   * @memberof XyoBoundWitnessSigningService
   */
  public async tryValidateSignatures(boundWitness: IXyoBoundWitness): Promise<void> {
    if (boundWitness.signatures.length !== boundWitness.publicKeys.length) {
      throw new Error(`Public key and signature set length mismatch`)
    }

    const signingData = this.boundWitnessSigningDataProducer.getSigningData(boundWitness)

    await Promise.all(boundWitness.signatures.map(async (sigSet, index) => {
      if (sigSet.length !== boundWitness.publicKeys[index].length) {
        throw new Error(`Public key and signature set length mismatch`)
      }

      return Promise.all(sigSet.map(async (sig, sigIndex) => {
        const signature = (sig as IXyoSignature)
        const publicKey = boundWitness.publicKeys[index][sigIndex]
        const isValid = await signature.verify(signingData, publicKey)

        if (!isValid) {
          throw new Error(`Signature [${index}][${sigIndex}] ${signature.encodedSignature.toString('hex')} is invalid`)
        }
      }))
    }))
  }
}
