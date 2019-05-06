import { XyoBoundWitness } from '../bound-witness'
import { XyoZigZagBoundWitnessSession } from '../bound-witness/xyo-zig-zag-bound-witness-session'
import { XyoNetworkHandler } from '../network/xyo-network-handler'
import { IXyoProcedureCatalog } from '../network/xyo-procedure-catalog'
import { XyoChoicePacket } from '../network/xyo-choice-packet'
import { XyoIterableStructure, XyoBuffer } from '@xyo-network/object-model'
import { IXyoBoundWitnessHander } from './xyo-bound-witness-handler'
import { XyoCatalogFlags } from '../network/xyo-catalog-flags'
import { IXyoSigner } from '../signing/xyo-signer'
import { IXyoPayloadConstructor } from '../origin/xyo-payload-constructor'

export class XyoZigZagBoundWitnessHander implements IXyoBoundWitnessHander {
  private payloadProvider: IXyoPayloadConstructor
  private currentBoundWitnessSession: XyoZigZagBoundWitnessSession | undefined

  constructor(payloadProvider: IXyoPayloadConstructor) {
    this.payloadProvider = payloadProvider
  }

  public async boundWitness(handler: XyoNetworkHandler, catalogue: IXyoProcedureCatalog, signers: IXyoSigner[]): Promise<XyoBoundWitness | undefined> {
    try {
      if (this.currentBoundWitnessSession !== undefined) {
        throw new Error('Bound witness is already in session')
      }

      const initData = handler.pipe.getInitiationData()

      if (initData) {
        const serverChoice = catalogue.choose(initData.getChoice())
        const cBw = await this.handleBoundWitness(undefined, handler, XyoCatalogFlags.flip(serverChoice), signers)
        return cBw
      }

      const response = await handler.sendCatalogPacket(catalogue.getEncodedCanDo())

      if (!response) {
        throw new Error('Response is undefined')
      }

      const adv = new XyoChoicePacket(response)
      const startingData = new XyoIterableStructure(new XyoBuffer(adv.getResponse()))
      const choice = adv.getChoice()
      const bw = await this.handleBoundWitness(startingData, handler, choice, signers)
      return bw
    } catch (error) {
      this.currentBoundWitnessSession = undefined
      return undefined
    }
  }

  private async handleBoundWitness(startingData: XyoIterableStructure | undefined, handler: XyoNetworkHandler, choice: Buffer, signers: IXyoSigner[])
  : Promise<XyoBoundWitness | undefined> {
    const payloads = await this.payloadProvider.getPayloads(choice)
    const boundWitness = new XyoZigZagBoundWitnessSession(handler, payloads.signed, payloads.unsigned, signers, XyoCatalogFlags.flip(choice))
    this.currentBoundWitnessSession = boundWitness

    await boundWitness.doBoundWitness(startingData)

    this.currentBoundWitnessSession = undefined

    return boundWitness
  }
}
