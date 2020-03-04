/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import { IXyoBoundWitnessPayload } from '../heuristics'

export interface IXyoPayloadConstructor {
  getPayloads(choice: Buffer): Promise<IXyoBoundWitnessPayload>
}
