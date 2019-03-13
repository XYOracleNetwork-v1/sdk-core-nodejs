import { XyoBoundWitness, FetterOrWitness } from '@xyo-network/bound-witness'

export class InnerBoundWitness extends XyoBoundWitness {
  constructor(fetterWitnesses: FetterOrWitness[], private readonly signingData: Buffer) {
    super(fetterWitnesses)
  }

  public getSigningData() {
    return this.signingData
  }
}
