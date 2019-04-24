import { IXyoSigner } from '../signing'
import { XyoBoundWitness, XyoZigZagBoundWitness } from '../bound-witness'
import { IXyoPayloadConstructor } from './xyo-payload-constructor'

export class XyoGenesisBlockCreator {
  public static async create (signers: IXyoSigner[], payloadProvider: IXyoPayloadConstructor): Promise<XyoBoundWitness> {
    const payload = await payloadProvider.getPayloads(Buffer.alloc(0))
    const boundWitness = new XyoZigZagBoundWitness(signers, payload.signed, payload.unsigned)
    boundWitness.incomingData(undefined, true)
    return boundWitness
  }
}
