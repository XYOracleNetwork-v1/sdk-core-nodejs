import { XyoHasher } from '../hashing'
import { XyoIterableStructure, XyoSchema, XyoStructure } from '../object-model'
import { XyoObjectSchema } from '../schema'
import { XyoSigner } from '../signing'

export class XyoBoundWitness extends XyoIterableStructure {
  public static createMasterArrayWithSubArray(
    masterSchema: XyoSchema,
    subSchema: XyoSchema,
    masterItems: XyoStructure[],
    subItems: XyoStructure[]
  ): XyoIterableStructure {
    const sub = XyoIterableStructure.newIterable(subSchema, subItems)
    const itemsInMaster: XyoStructure[] = [sub]

    for (const materItem of masterItems) {
      itemsInMaster.push(materItem)
    }

    return XyoIterableStructure.newIterable(masterSchema, itemsInMaster)
  }

  public getIsCompleted(): boolean {
    if (this.getId(XyoObjectSchema.WITNESS.id).length !== 0) {
      return (
        this.getId(XyoObjectSchema.WITNESS.id).length ===
        this.getId(XyoObjectSchema.FETTER.id).length
      )
    }
    return false
  }

  // [party index][key index]
  public getPublicKeys(): XyoStructure[][] {
    const keysets: XyoStructure[][] = []
    const fetters = this.getId(
      XyoObjectSchema.FETTER.id
    ) as XyoIterableStructure[]

    for (const fetter of fetters) {
      const keyset: XyoStructure[] = []
      const partyKeySets = fetter.getId(
        XyoObjectSchema.KEY_SET.id
      ) as XyoIterableStructure[]

      for (const partyKeySet of partyKeySets) {
        const keysetIt = partyKeySet.newIterator()
        while (keysetIt.hasNext()) {
          keyset.push(keysetIt.next().value)
        }
      }
      keysets.push(keyset)
    }

    return keysets
  }

  // [party index][key index]
  public getSignatures(): XyoStructure[][] {
    const signatureSets: XyoStructure[][] = []
    const witnesses = this.getId(
      XyoObjectSchema.WITNESS.id
    ) as XyoIterableStructure[]

    for (const fetter of witnesses) {
      const signatureSet: XyoStructure[] = []
      const partySignatureSets = fetter.getId(
        XyoObjectSchema.SIGNATURE_SET.id
      ) as XyoIterableStructure[]

      for (const partySignatureSet of partySignatureSets) {
        const signatureSetIt = partySignatureSet.newIterator()
        while (signatureSetIt.hasNext()) {
          signatureSet.push(signatureSetIt.next().value)
        }
      }
      signatureSets.push(signatureSet)
    }

    return signatureSets
  }

  // [party index][key index]
  public getHeuristics(): XyoStructure[][] {
    const heuristics: XyoStructure[][] = []
    const fetters = this.getId(
      XyoObjectSchema.FETTER.id
    ) as XyoIterableStructure[]

    for (const fetter of fetters) {
      const partyHeuristics: XyoStructure[] = []
      const fetterIt = fetter.newIterator()
      while (fetterIt.hasNext()) {
        partyHeuristics.push(fetterIt.next().value)
      }
      heuristics.push(partyHeuristics)
    }

    return heuristics
  }

  public getNumberOfFetters(): number {
    return this.getId(XyoObjectSchema.FETTER.id).length
  }

  public getNumberOfWitnesses(): number {
    return this.getId(XyoObjectSchema.WITNESS.id).length
  }

  public getHash(hasher: XyoHasher): XyoStructure {
    return hasher.hash(this.getSigningData())
  }

  public sign(signer: XyoSigner): XyoStructure {
    return signer.sign(this.getSigningData())
  }

  public getSigningData(): Buffer {
    const bounds = this.getWitnessFetterBoundary()
    return this.getValue().getContentsCopy().slice(0, bounds)
  }

  public getNumberOfParties(): number | undefined {
    const numberOfFetters = this.getNumberOfFetters()
    const numberOfWitnesses = this.getNumberOfWitnesses()

    if (numberOfFetters === numberOfWitnesses) {
      return numberOfWitnesses
    }

    return undefined
  }

  public getFetterOfParty(
    partyIndex: number
  ): XyoIterableStructure | undefined {
    const numberOfParties = this.getNumberOfParties()

    if (numberOfParties) {
      if (numberOfParties <= partyIndex) {
        return undefined
      }

      return this.get(partyIndex) as XyoIterableStructure
    }

    return undefined
  }

  public getWitnessOfParty(
    partyIndex: number
  ): XyoIterableStructure | undefined {
    const numberOfParties = this.getNumberOfParties()

    if (numberOfParties) {
      if (numberOfParties <= partyIndex) {
        return undefined
      }

      return this.get(
        numberOfParties * 2 - (partyIndex + 1)
      ) as XyoIterableStructure
    }

    return undefined
  }

  protected addToLedger(item: XyoStructure) {
    if (this.getIsCompleted()) {
      throw new Error('Bound witness is completed')
    }

    this.addElement(item)
  }

  private getWitnessFetterBoundary(): number {
    const fetters = this.getId(XyoObjectSchema.FETTER.id)
    let offsetIndex = 0

    for (const fetter of fetters) {
      offsetIndex += fetter.getAll().getSize()
    }

    return offsetIndex
  }
}
