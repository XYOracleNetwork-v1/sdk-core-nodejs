import { IXyoBoundWitnessPayload } from '../huerestics/xyo-payload'

export interface IXyoPayloadConstructor {
  getPayloads (choice: Buffer): Promise<IXyoBoundWitnessPayload>
}
