
import { IXyoBoundWitnessPayload } from '../heuristics'

export interface IXyoPayloadConstructor {
  getPayloads (choice: Buffer): Promise<IXyoBoundWitnessPayload>
}
