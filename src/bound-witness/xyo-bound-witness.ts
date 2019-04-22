import { XyoIterableStructure, XyoStructure } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../schema'
import { IXyoHasher } from '../hashing/xyo-hasher'

export class XyoBoundWitness extends XyoIterableStructure {

  public getIsCompleted (): boolean {
    if (this.getId(XyoObjectSchema.WITNESS.id).length !== 0) {
      return this.getId(XyoObjectSchema.WITNESS.id).length === this.getId(XyoObjectSchema.FETTER.id).length
    }
    return false
  }

  public getNumberOfFetters (): number {
    return this.getId(XyoObjectSchema.FETTER.id).length
  }

  public getNumberOfWitnesses (): number {
    return this.getId(XyoObjectSchema.WITNESS.id).length
  }

  public getHash (hasher: IXyoHasher): XyoStructure {
    return hasher.hash(this.getSigningData())
  }

  public getSigningData (): Buffer {
    const bounds = this.getWitnessFetterBoundary()
    return this.getValue().getContentsCopy().slice(0, bounds)
  }

  public getNumberOfParties (): number | undefined {
    const numberOfFetters = this.getNumberOfFetters()
    const numberOfWitnesses = this.getNumberOfWitnesses()

    if (numberOfFetters === numberOfWitnesses) {
      return numberOfWitnesses
    }

    return undefined
  }

  public getFetterOfParty (partyIndex: number): XyoIterableStructure | undefined {
    const numberOfParties = this.getNumberOfParties()

    if (numberOfParties) {
      if (numberOfParties <= partyIndex) {
        return undefined
      }

      return (this.get(partyIndex) as XyoIterableStructure)
    }

    return undefined
  }

  public getWitnessOfParty (partyIndex: number): XyoIterableStructure | undefined {
    const numberOfParties = this.getNumberOfParties()

    if (numberOfParties) {
      if (numberOfParties <= partyIndex) {
        return undefined
      }

      return (this.get((numberOfParties * 2) - (partyIndex + 1)) as XyoIterableStructure)
    }

    return undefined
  }

  private getWitnessFetterBoundary (): number {
    const fetters = this.getId(XyoObjectSchema.FETTER.id)
    let offsetIndex = 0

    for (const fetter of fetters) {
      offsetIndex += fetter.getContents().getSize()
    }

    return offsetIndex
  }
}
