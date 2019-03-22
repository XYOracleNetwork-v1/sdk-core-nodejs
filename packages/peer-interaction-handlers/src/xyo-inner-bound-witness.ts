import { XyoBoundWitness, FetterOrWitness } from '@xyo-network/bound-witness'

export class InnerBoundWitness extends XyoBoundWitness {
  constructor(fetterWitnesses: FetterOrWitness[], private readonly signingData: Buffer, respectedData?: Buffer) {
    super(fetterWitnesses, respectedData)
  }

  public getSigningData() {
    return this.signingData
  }
}
