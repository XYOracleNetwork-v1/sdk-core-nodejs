/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 1:57:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-zig-zag-bound-witness-builder.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 3:29:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { IXyoSigner, IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoPayload, XyoBoundWitnessSigningService, IXyoBoundWitness } from '@xyo-network/bound-witness'
import { XyoBoundWitnessTransfer } from './xyo-bound-witness-transfer'
import { XyoError, XyoErrors } from '@xyo-network/errors'

export class XyoZigZagBoundWitnessBuilder extends XyoBase {

  private readonly dynamicPayloads: IXyoPayload[] = []

  /**
   * The set of public key sets for all parties. One per party.
   * But, each KeySet can have many keys if a party wants to
   * includes multiple public-key / signatures
   */

  private readonly dynamicPublicKeys: IXyoPublicKey[][] = []

  /**
   * The set of signatures for all parties.
   * As with the public keys, each party can have multiple signatures. The index of
   * a signature within a set should correspond to the index of same public key
   */

  private readonly dynamicSignatureSets: IXyoSignature[][] = []

  /** True if the key and payloads of this party have been added to the bound-witness */
  private hasSentKeysAndPayload = false

  constructor (
    private readonly signers: IXyoSigner[],
    private readonly payload: IXyoPayload,
    private readonly boundWitnessSigningService: XyoBoundWitnessSigningService
  ) {
    super()
  }

  /**
   * The currents state of signatures for all parties involved in the bound-witness
   */

  get signatures() {
    return this.dynamicSignatureSets
  }

  /**
   * The currents state of public keys for all parties involved in the bound-witness
   */

  get publicKeys() {
    return this.dynamicPublicKeys
  }

  /**
   * The currents state of payloads for all parties involved in the bound-witness
   */

  get payloads () {
    return this.dynamicPayloads
  }

  public async incomingData(transfer: XyoBoundWitnessTransfer | undefined, endPoint: boolean) {
    const keysToSend: IXyoPublicKey[][] = []
    const payloadsToSend: IXyoPayload[] = []
    const signatureToSend: IXyoSignature[][] = []
    const signatureReceivedSize = (transfer && transfer.signatureToSend && transfer.signatureToSend.length) || 0

    if (transfer) {
      this.addTransfer(transfer)
    }

    if (!this.hasSentKeysAndPayload) {
      this.dynamicPublicKeys.push(this.makeSelfKeySet())
      this.dynamicPayloads.push(this.payload)
      this.hasSentKeysAndPayload = true
    }

    if (this.signatures.length !== this.publicKeys.length) {
      if (this.signatures.length === 0 && !endPoint) {
        this.publicKeys.forEach(key => keysToSend.push(key))
        this.payloads.forEach(payload => payloadsToSend.push(payload))
      } else {
        await this.signForSelf()

        for (let i = signatureReceivedSize + 1; i < this.publicKeys.length; i += 1) {
          keysToSend.push(this.publicKeys[i])
        }

        for (let i = signatureReceivedSize + 1; i < this.payloads.length; i += 1) {
          payloadsToSend.push(this.payloads[i])
        }

        for (let i = (this.signatures.length - signatureReceivedSize) - 1; i >= 0; i -= 1) {
          signatureToSend.push(this.signatures[i])
        }
      }
    }

    return new XyoBoundWitnessTransfer(keysToSend, payloadsToSend, signatureToSend)
  }

  private makeSelfKeySet(): IXyoPublicKey[] {
    const publicKeys: IXyoPublicKey[] = []

    this.signers.forEach((signer) => {
      const publicKey = signer.publicKey

      const publicKeyValue = publicKey

      if (publicKeyValue) {
        publicKeys.push(publicKeyValue)
      }
    })

    return publicKeys
  }

  /**
   * Creates the signature set for this party and adds its to the bound-witness's
   * signatures
   */

  private async signForSelf() {
    const signatureSet = await this.signBoundWitness()
    this.dynamicSignatureSets.unshift(signatureSet)
  }

  /**
   * For each signer that belongs to the owner of this bound-witness, this
   * will create a signature for the particular signing algorithm.
   */

  private async signBoundWitness(): Promise<IXyoSignature[]> {
    return Promise.all(this.signers.map(async (signer) => {
      const signature = await this.boundWitnessSigningService.sign(this as IXyoBoundWitness, signer)
      return signature
    }))
  }

  /**
   * A helper function to integrate existing transfer data into the bound-witness
   */

  private addTransfer(transfer: XyoBoundWitnessTransfer) {
    this.addIncomingKeys(transfer.keysToSend)
    this.addIncomingPayload(transfer.payloadsToSend)
    this.addIncomingSignatures(transfer.signatureToSend)
  }

  /**
   * Adds other parties public keys into the bound-witness
   */

  private addIncomingKeys(incomingKeySets: IXyoPublicKey[][]) {
    for (const incomingKeySet of incomingKeySets) {
      if (incomingKeySet) {
        this.dynamicPublicKeys.push(incomingKeySet)
      } else {
        throw new XyoError(`Error unpacking keyset`, XyoErrors.CRITICAL)
      }
    }
  }

  /**
   * Adds other parties payloads into the bound-witness
   */

  private addIncomingPayload(incomingPayloads: IXyoPayload[]) {
    for (const incomingPayload of incomingPayloads) {
      if (incomingPayload) {
        this.dynamicPayloads.push(incomingPayload)
      } else {
        throw new XyoError(`Error unpacking payload`, XyoErrors.CRITICAL)
      }
    }
  }

  /**
   * Adds other parties signatures into the bound-witness
   */

  private addIncomingSignatures(incomingSignatures: IXyoSignature[][]) {
    for (const incomingSignatureSet of incomingSignatures) {
      if (incomingSignatureSet) {
        this.dynamicSignatureSets.unshift(incomingSignatureSet)
      } else {
        throw new XyoError(`Error unpacking signatureSet`, XyoErrors.CRITICAL)
      }
    }
  }
}
