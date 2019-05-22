import { IXyoHasher } from './xyo-hasher'
import { XyoStructure, XyoBuffer } from '../object-model'
import crypto from 'crypto'
import { XyoObjectSchema } from '../schema'

export class XyoSha256 implements IXyoHasher {

  public hash(data: Buffer): XyoStructure {
    const rawHash = crypto.createHash('sha256').update(data).digest()
    const buffer = new XyoBuffer(rawHash)
    return XyoStructure.newInstance(XyoObjectSchema.SHA_256, buffer)
  }

}
