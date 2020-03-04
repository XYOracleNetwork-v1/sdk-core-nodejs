/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import { XyoStructure } from '../object-model'

export interface IXyoSigner {
  sign(data: Buffer): XyoStructure
  getPublicKey(): XyoStructure
  getPrivateKey(): XyoStructure
}

export type XyoSignatureVerify = (
  publicKey: Buffer,
  signature: Buffer,
  data: Buffer
) => Promise<boolean>
