import { XyoBoundWitness } from './xyo-bound-witness'
import { IXyoSigner } from '../signing/xyo-signer'
import { XyoStructure, XyoIterableStructure } from '../object-model'
import { XyoObjectSchema } from '../schema'

export class XyoZigZagBoundWitness extends XyoBoundWitness {
  private signers: IXyoSigner[]
  private signedPayload: XyoStructure[]
  private unsignedPayload: XyoStructure[]
  private hasSentFetter = false

  constructor(signers: IXyoSigner[], signedPayload: XyoStructure[], unsignedPayload: XyoStructure[]) {
    super(XyoIterableStructure.newIterable(XyoObjectSchema.BW, []).getAll())

    this.signers = signers
    this.signedPayload = signedPayload
    this.unsignedPayload = unsignedPayload
  }

  public incomingData(transfer: XyoIterableStructure | undefined, endpoint: boolean): XyoIterableStructure {
    if (transfer) {
      this.addTransfer(transfer)
    }

    if (!this.hasSentFetter) {
      const fetter = XyoBoundWitness.createMasterArrayWithSubArray(XyoObjectSchema.FETTER, XyoObjectSchema.KEY_SET, this.signedPayload, this.getPublicKeysOfSigners())

      this.addToLedger(fetter)
      this.hasSentFetter = true
    }

    if (this.getNumberOfFetters() !== this.getNumberOfWitnesses()) {
      return this.getReturnFromIncoming(this.getNumberOfWitnessesFromTransfer(transfer), endpoint)
    }

    return this.encodeTransfer([])
  }

  private getNumberOfWitnessesFromTransfer(transfer: XyoIterableStructure | undefined) {
    if (transfer) {
      return transfer.getId(XyoObjectSchema.WITNESS.id).length
    }

    return 0
  }

  private getReturnFromIncoming(numberOfWitnesses: number, endpoint: boolean) {
    if (numberOfWitnesses === 0 && !endpoint) {
      const elements: XyoStructure[] = []
      const it = this.newIterator()

      while (it.hasNext()) {
        elements.push(it.next().value)
      }

      return this.encodeTransfer(elements)
    }

    return this.passAndSign(numberOfWitnesses)
  }

  private passAndSign(numberOfWitnesses: number): XyoIterableStructure {
    const toSendBack: XyoStructure[] = []

    this.signBoundWitness(this.unsignedPayload)

    const fetters = this.getId(XyoObjectSchema.FETTER.id)
    const witnesses = this.getId(XyoObjectSchema.WITNESS.id)

    const x = numberOfWitnesses + 1
    const y = fetters.length - 1

    if (x <= y) {
      for (let i = x; i <= y ; i++) {
        toSendBack.push(fetters[i])
      }
    }

    toSendBack.push(witnesses[witnesses.length - 1])

    return this.encodeTransfer(toSendBack)
  }

  private encodeTransfer(items: XyoStructure[]) {
    const fetters: XyoStructure[] = []
    const witness: XyoStructure[] = []

    for (const item of items) {
      switch (item.getSchema().id) {
        case XyoObjectSchema.FETTER.id:
          fetters.push(item)
          break
        case XyoObjectSchema.WITNESS.id:
          witness.push(item)
          break
        default:
          throw new Error('Must be fetter or witness')
      }
    }

    return this.encodeFettersAndWitnessesForTransfer(fetters, witness, items)
  }

  private encodeFettersAndWitnessesForTransfer(fetters: XyoStructure[], witness: XyoStructure[], items: XyoStructure[]): XyoIterableStructure {
    if (fetters.length === 0 && witness.length !== 0) {
      return XyoIterableStructure.newIterable(XyoObjectSchema.WITNESS_SET, witness)
    }

    if (fetters.length !== 0 && witness.length === 0) {
      return XyoIterableStructure.newIterable(XyoObjectSchema.FETTER_SET, fetters)
    }

    return XyoIterableStructure.newIterable(XyoObjectSchema.BW_FRAGMENT, items)
  }

  private addTransfer(transfer: XyoIterableStructure) {
    XyoIterableStructure.validate(transfer)

    const it = transfer.newIterator()

    while (it.hasNext()) {
      this.addToLedger(it.next().value)
    }
  }

  private getPublicKeysOfSigners(): XyoStructure[] {
    const publicKeys: XyoStructure[] = []

    for (const signer of this.signers) {
      publicKeys.push(signer.getPublicKey())
    }

    return publicKeys
  }

  private signBoundWitness(payload: XyoStructure[]) {
    const signatures: XyoStructure[] = []

    for (const signer of this.signers) {
      signatures.push(this.sign(signer))
    }

    const witness = XyoBoundWitness.createMasterArrayWithSubArray(XyoObjectSchema.WITNESS, XyoObjectSchema.SIGNATURE_SET, this.unsignedPayload, signatures)

    this.addToLedger(witness)
  }
}
