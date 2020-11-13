import { XyoStructure } from '../object-model'

abstract class XyoSigner {
  abstract sign(data: Buffer): XyoStructure
  abstract getPublicKey(): XyoStructure
  abstract getPrivateKey(): XyoStructure
}

export type XyoSignatureVerify = (
  publicKey: Buffer,
  signature: Buffer,
  data: Buffer
) => Promise<boolean>

export default XyoSigner
