/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { XyoZigZagBoundWitness } from './xyo-zig-zag-bound-witness'
import { XyoNetworkHandler } from '../network/xyo-network-handler'
import { XyoStructure, XyoIterableStructure, XyoBuffer } from '../object-model'
import { IXyoSigner } from '../signing/xyo-signer'

export class XyoZigZagBoundWitnessSession extends XyoZigZagBoundWitness {
  private handler: XyoNetworkHandler
  private choice: Buffer
  private cycles = 0

  constructor(
    handler: XyoNetworkHandler,
    signedPayload: XyoStructure[],
    unsignedPayload: XyoStructure[],
    signers: IXyoSigner[],
    choice: Buffer
  ) {
    super(signers, signedPayload, unsignedPayload)

    this.handler = handler
    this.choice = choice
  }

  public async doBoundWitness(
    transfer: XyoIterableStructure | undefined
  ): Promise<void> {
    if (!this.getIsCompleted()) {
      const response = await this.sendAndReceive(
        transfer !== undefined,
        transfer
      )

      if (this.cycles === 0 && transfer !== undefined && response !== null) {
        this.incomingData(response, false)
      } else {
        this.cycles++
        return this.doBoundWitness(response)
      }
    }
  }

  private async sendAndReceive(
    didHaveData: boolean,
    transfer: XyoIterableStructure | undefined
  ) {
    let response: Buffer | undefined
    const returnData = this.incomingData(
      transfer,
      this.cycles === 0 && didHaveData
    )

    if (this.cycles === 0 && !didHaveData) {
      response = await this.handler.sendChoicePacket(
        this.choice,
        returnData.getAll().getContentsCopy()
      )
    } else {
      response = await this.handler.pipe.send(
        returnData.getAll().getContentsCopy(),
        this.cycles === 0
      )

      if (this.cycles === 0 && !response) {
        throw new Error('Response is null')
      }
    }

    if (response) {
      return new XyoIterableStructure(new XyoBuffer(response))
    }

    return undefined
  }
}
