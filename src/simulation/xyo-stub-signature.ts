import { XyoBuffer, XyoStructure } from '../object-model'
import { XyoObjectSchema } from '../schema'
import XyoSigner, { XyoSignatureVerify } from '../signing/xyo-signer'

export class XyoStubSigner implements XyoSigner {
  public static verify: XyoSignatureVerify = async (
    _publicKey: Buffer,
    _signature: Buffer,
    _data: Buffer
    // eslint-disable-next-line require-await
  ): Promise<boolean> => {
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
    return XyoStructure.newInstance(
      XyoObjectSchema.STUB_SIGNATURE,
      new XyoBuffer(data)
    )
  }

  public getPublicKey(): XyoStructure {
    return XyoStructure.newInstance(
      XyoObjectSchema.STUB_PUBLIC_KEY,
      new XyoBuffer(this.key)
    )
  }

  public getPrivateKey(): XyoStructure {
    return XyoStructure.newInstance(
      XyoObjectSchema.EC_PRIVATE_KEY,
      new XyoBuffer(Buffer.from('0000', 'utf8'))
    )
  }
}
