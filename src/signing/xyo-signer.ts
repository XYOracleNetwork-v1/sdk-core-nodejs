import { XyoStructure } from '@xyo-network/object-model'

export interface IXyoSigner {
  sign (data: Buffer): XyoStructure
  getPublicKey (): XyoStructure
  getPrivateKey (): XyoStructure
}
