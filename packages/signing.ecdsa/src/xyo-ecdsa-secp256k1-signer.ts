/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:08:19 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-secp256k1-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th December 2018 12:18:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSigner, IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { XyoBase } from '@xyo-network/base'
import { XyoEcdsaSecp256k1UnCompressedPublicKey } from './xyo-ecdsa-secp256k1-uncompressed-public-key'
import { XyoEcdsaSignature } from './xyo-ecdsa-signature'

export class XyoEcdsaSecp256k1Signer extends XyoBase implements IXyoSigner {

  constructor (
    private readonly verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey) => Promise<boolean>,
    private readonly sign: (data: Buffer) => Promise<Buffer>,
    private readonly getPublicXY: () => {x: Buffer, y: Buffer},
    private readonly getPrivateKey: () => string,
    private readonly ecdsaSecp256k1UnCompressedPublicKeyObjectSchemaId: number,
    private readonly ecdsaSecp256k1SignatureObjectSchemaId: number
  ) {
    super()
  }

  /**
   * Signs the data blob with private key
   *
   * @param data An arbitrary data-blob to sign
   */

  public async signData(data: Buffer): Promise<IXyoSignature> {
    const sig = await this.sign(data)
    return new XyoEcdsaSignature(sig, this.ecdsaSecp256k1SignatureObjectSchemaId, this.verifySign)
  }

  /**
   * Returns the public key of this crypto key pair
   */

  get publicKey (): XyoEcdsaSecp256k1UnCompressedPublicKey {
    const { x, y } = this.getPublicXY()
    return new XyoEcdsaSecp256k1UnCompressedPublicKey(x, y, this.ecdsaSecp256k1UnCompressedPublicKeyObjectSchemaId)
  }

  /**
   * Gets the private key of the crypto-pair
   *
   * @readonly
   * @type {string}
   * @memberof XyoEcdsaSecp256k1Signer
   */

  get privateKey (): string {
    return this.getPrivateKey()
  }
}
