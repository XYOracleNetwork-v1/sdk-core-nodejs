import { XyoBoundWitness, XyoZigZagBoundWitness } from '../bound-witness'
import { XyoSigner } from '../signing'
import XyoPayloadConstructor from './xyo-payload-constructor'

export class XyoGenesisBlockCreator {
  public static async create(
    signers: XyoSigner[],
    payloadProvider: XyoPayloadConstructor
  ): Promise<XyoBoundWitness> {
    const payload = await payloadProvider.getPayloads(Buffer.alloc(0))
    const boundWitness = new XyoZigZagBoundWitness(
      signers,
      payload.signed,
      payload.unsigned
    )
    boundWitness.incomingData(undefined, true)
    return boundWitness
  }
}
