/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import { XyoStructure } from '../object-model'

export interface IXyoHasher {
  hash(data: Buffer): XyoStructure
}
