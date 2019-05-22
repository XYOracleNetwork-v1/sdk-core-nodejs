import { XyoStructure } from '../object-model'

export interface IXyoHasher {
  hash(data: Buffer): XyoStructure
}
