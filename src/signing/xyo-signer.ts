import { XyoStructure } from '../object-model'

export interface IXyoSigner {
  sign(data: Buffer): XyoStructure
  getPublicKey(): XyoStructure
  getPrivateKey(): XyoStructure
}

export type XyoSignatureVerify = (publicKey: Buffer, signature: Buffer, data: Buffer) => Promise<boolean>
