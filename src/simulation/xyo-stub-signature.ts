import { IXyoSigner, XyoSignatureVerify } from '../signing/xyo-signer'
import { XyoStructure, XyoBuffer } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../schema'
import { resolve } from 'path'

export class XyoStubSigner implements IXyoSigner {

  public static verify: XyoSignatureVerify = async(publicKey: Buffer, signature: Buffer, data: Buffer): Promise<boolean> => {
    return true
  }
  private key: Buffer

  constructor(key?: Buffer) {
    if (key) {
      this.key = key
      return
    }
    throw new Error('Stub signer a needs key!')
  }

  public sign(data: Buffer): XyoStructure {
    return XyoStructure.newInstance(XyoObjectSchema.STUB_SIGNATURE, new XyoBuffer(data))
  }

  public getPublicKey(): XyoStructure {
    return XyoStructure.newInstance(XyoObjectSchema.STUB_PUBLIC_KEY, new XyoBuffer(this.key))
  }

  public getPrivateKey(): XyoStructure {
    return XyoStructure.newInstance(XyoObjectSchema.EC_PRIVATE_KEY, new XyoBuffer(Buffer.from('0000', 'utf8')))
  }

}
