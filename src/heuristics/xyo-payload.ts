/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/member-delimiter-style */
import { XyoStructure } from '../object-model'

export interface IXyoBoundWitnessPayload {
  signed: XyoStructure[]
  unsigned: XyoStructure[]
}
