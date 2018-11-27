/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 1:57:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-zig-zag-bound-witness-builder.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 10:36:12 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSigner, IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoPayload, XyoBoundWitnessSigningService, IXyoBoundWitness, XyoBaseBoundWitness } from '@xyo-network/bound-witness'

export class XyoZigZagBoundWitnessBuilder extends XyoBaseBoundWitness {

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

  public async incomingData(transfer: IXyoBoundWitness | undefined, endPoint: boolean): Promise<IXyoBoundWitness> {
    if (transfer) {
      this.addTransfer(transfer)
    }

    if (!this.hasSentKeysAndPayload) {
      this.dynamicPublicKeys.push(this.makeSelfKeySet())
      this.dynamicPayloads.push(this.payload)
      this.hasSentKeysAndPayload = true
    }

    if (this.signatures.length !== this.publicKeys.length) {
      return this.getReturnFromIncoming(transfer ? transfer.signatures.length : 0, endPoint)
    }

    return new InnerBoundWitness([], [], [])
  }

  private makeSelfKeySet() {
    return this.signers.map(signer => signer.publicKey)
  }

  private addTransfer(transfer: IXyoBoundWitness) {
    transfer.publicKeys.forEach(pks => this.dynamicPublicKeys.push(pks))
    transfer.payloads.forEach(pks => this.dynamicPayloads.push(pks))
    transfer.signatures.forEach(pks => this.dynamicSignatureSets.push(pks))
  }

  private async getReturnFromIncoming (
    signatureReceivedSize: number,
    endPoint: boolean
  ): Promise<IXyoBoundWitness> {

    if (this.signatures.length === 0 && !endPoint) {
      return this
    }

    return this.passAndSign(signatureReceivedSize)
  }

  private async passAndSign (signatureReceivedSize: number): Promise<IXyoBoundWitness> {
    const keysToSend: IXyoPublicKey[][] = []
    const payloadsToSend: IXyoPayload[] = []
    const signatureToSend: IXyoSignature[][] = []

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

    return new InnerBoundWitness(keysToSend, signatureToSend, payloadsToSend)
  }

  private async signForSelf() {
    const signatureSet = await this.signBoundWitness()
    this.dynamicSignatureSets.unshift(signatureSet)
  }

  private async signBoundWitness(): Promise<IXyoSignature[]> {
    return Promise.all(this.signers.map(signer => this.boundWitnessSigningService.sign(this, signer)))
  }
}

    // tslint:disable-next-line:max-classes-per-file
class InnerBoundWitness extends XyoBaseBoundWitness {

  constructor (
    public readonly publicKeys: IXyoPublicKey[][],
    public readonly signatures: IXyoSignature[][],
    public readonly payloads: IXyoPayload[]
  ) {
    super()
  }
}
