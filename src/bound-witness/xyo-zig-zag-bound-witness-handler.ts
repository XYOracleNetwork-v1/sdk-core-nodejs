import { XyoBoundWitness } from '../bound-witness'
import { XyoZigZagBoundWitnessSession } from '../bound-witness/xyo-zig-zag-bound-witness-session'
import { XyoNetworkHandler } from '../network/xyo-network-handler'
import { IXyoProcedureCatalogue } from '../network/xyo-procedure-catalogue'
import { XyoChoicePacket } from '../network/xyo-choice-packet'
import { XyoIterableStructure, XyoBuffer, XyoStructure } from '@xyo-network/object-model'
import { IXyoBoundWitnessHander } from './xyo-bound-witness-handler'
import { XyoCatalogueFlags } from '../network/xyo-catalogue-flags'
import { IXyoSigner } from '../signing/xyo-signer'

export interface IXyoBoundWitnessPayload {
  signed: XyoStructure[]
  unsigned: XyoStructure[]
}

export class XyoZigZagBoundWitnessHander implements IXyoBoundWitnessHander {
  private currentBoundWitnessSession: XyoZigZagBoundWitnessSession | undefined

  public async boundWitness (handler: XyoNetworkHandler, catalogue: IXyoProcedureCatalogue, signers: IXyoSigner[]): Promise<XyoBoundWitness | undefined> {
    if (this.currentBoundWitnessSession !== null) {
      throw new Error('Bound witness is already in session')
    }

    const initData = handler.pipe.getInitiationData()

    if (initData) {
      const serverChoice = catalogue.choose(initData.getChoice())
      return this.handleBoundWitness(undefined, handler, XyoCatalogueFlags.flip(serverChoice), signers)
    }

    const response = await handler.sendCataloguePacket(catalogue.getEncodedCanDo())

    if (!response) {
      throw new Error('Response is undefined')
    }

    const adv = new XyoChoicePacket(response)
    const startingData = new XyoIterableStructure(XyoBuffer.wrapBuffer(adv.getResponse()))
    const choice = adv.getChoice()
    return this.handleBoundWitness(startingData, handler, choice, signers)
  }

  private async getPayloads (choice: Buffer): Promise<IXyoBoundWitnessPayload> {
    const payload: IXyoBoundWitnessPayload = {
      signed: [],
      unsigned: []
    }

    return payload
  }

  private async handleBoundWitness (startingData: XyoIterableStructure | undefined, handler: XyoNetworkHandler, choice: Buffer, signers: IXyoSigner[])
  : Promise<XyoBoundWitness | undefined> {
    const payloads = await this.getPayloads(choice)
    const boundWitness = new XyoZigZagBoundWitnessSession(handler, payloads.signed, payloads.unsigned, signers, XyoCatalogueFlags.flip(choice))
    this.currentBoundWitnessSession = boundWitness

    await boundWitness.doBoundWitness(startingData)

    this.currentBoundWitnessSession = undefined

    return boundWitness
  }
}
