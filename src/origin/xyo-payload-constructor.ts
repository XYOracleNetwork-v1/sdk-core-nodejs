import { IXyoBoundWitnessPayload } from '../heuristics/xyo-payload'

export interface IXyoPayloadConstructor {
  getPayloads (choice: Buffer): Promise<IXyoBoundWitnessPayload>
}
