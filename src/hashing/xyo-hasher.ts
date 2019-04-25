import { XyoStructure } from '@xyo-network/object-model'

export interface IXyoHasher {
  hash(data: Buffer): XyoStructure
}
