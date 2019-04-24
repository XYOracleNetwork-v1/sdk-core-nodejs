import { XyoStructure } from '@xyo-network/object-model'

export interface IXyoBoundWitnessPayload {
  signed: XyoStructure[]
  unsigned: XyoStructure[]
}
