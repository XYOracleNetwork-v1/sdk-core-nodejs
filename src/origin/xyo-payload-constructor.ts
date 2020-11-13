import { IXyoBoundWitnessPayload } from '../heuristics'

abstract class XyoPayloadConstructor {
  abstract getPayloads(choice: Buffer): Promise<IXyoBoundWitnessPayload>
}

export default XyoPayloadConstructor
