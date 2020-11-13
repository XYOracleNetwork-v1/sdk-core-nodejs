import { XyoStructure } from '../object-model'

abstract class XyoHasher {
  abstract hash(data: Buffer): XyoStructure
}

export default XyoHasher
