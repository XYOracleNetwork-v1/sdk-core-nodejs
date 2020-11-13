import { XyoCatalogFlags } from '../network/xyo-catalog-flags'
import { XyoChoicePacket } from '../network/xyo-choice-packet'
import { XyoNetworkHandler } from '../network/xyo-network-handler'
import XyoProcedureCatalog from '../network/xyo-procedure-catalog'
import { XyoBuffer, XyoIterableStructure } from '../object-model'
import XyoPayloadConstructor from '../origin/xyo-payload-constructor'
import { XyoSigner } from '../signing'
import { XyoBoundWitness } from './xyo-bound-witness'
import XyoBoundWitnessHander from './xyo-bound-witness-handler'
import { XyoZigZagBoundWitnessSession } from './xyo-zig-zag-bound-witness-session'

export class XyoZigZagBoundWitnessHander extends XyoBoundWitnessHander {
  private payloadProvider: XyoPayloadConstructor
  private currentBoundWitnessSession: XyoZigZagBoundWitnessSession | undefined

  constructor(payloadProvider: XyoPayloadConstructor) {
    super()
    this.payloadProvider = payloadProvider
  }

  public async boundWitness(
    handler: XyoNetworkHandler,
    catalogue: XyoProcedureCatalog,
    signers: XyoSigner[]
  ): Promise<XyoBoundWitness | undefined> {
    try {
      if (this.currentBoundWitnessSession !== undefined) {
        throw new Error('Bound witness is already in session')
      }

      const initData = handler.pipe.getInitiationData()

      if (initData) {
        const serverChoice = catalogue.choose(initData.getChoice())
        const cBw = await this.handleBoundWitness(
          undefined,
          handler,
          XyoCatalogFlags.flip(serverChoice),
          signers
        )
        return cBw
      }

      const response = await handler.sendCatalogPacket(
        catalogue.getEncodedCanDo()
      )

      if (!response) {
        throw new Error('Response is undefined')
      }

      const adv = new XyoChoicePacket(response)
      const startingData = new XyoIterableStructure(
        new XyoBuffer(adv.getResponse())
      )
      const choice = adv.getChoice()
      const bw = await this.handleBoundWitness(
        startingData,
        handler,
        choice,
        signers
      )
      return bw
    } catch (error) {
      this.currentBoundWitnessSession = undefined
      return undefined
    }
  }

  private async handleBoundWitness(
    startingData: XyoIterableStructure | undefined,
    handler: XyoNetworkHandler,
    choice: Buffer,
    signers: XyoSigner[]
  ): Promise<XyoBoundWitness | undefined> {
    const payloads = await this.payloadProvider.getPayloads(choice)
    const boundWitness = new XyoZigZagBoundWitnessSession(
      handler,
      payloads.signed,
      payloads.unsigned,
      signers,
      XyoCatalogFlags.flip(choice)
    )
    this.currentBoundWitnessSession = boundWitness

    await boundWitness.doBoundWitness(startingData)

    this.currentBoundWitnessSession = undefined

    return boundWitness
  }
}
