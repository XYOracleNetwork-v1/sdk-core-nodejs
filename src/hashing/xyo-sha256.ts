import crypto from 'crypto'

import { XyoBuffer, XyoStructure } from '../object-model'
import { XyoObjectSchema } from '../schema'
import XyoHasher from './xyo-hasher'

export class XyoSha256 implements XyoHasher {
  public hash(data: Buffer): XyoStructure {
    const rawHash = crypto.createHash('sha256').update(data).digest()
    const buffer = new XyoBuffer(rawHash)
    return XyoStructure.newInstance(XyoObjectSchema.SHA_256, buffer)
  }
}
