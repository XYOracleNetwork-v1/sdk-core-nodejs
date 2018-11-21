/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:08:19 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-secp256k1-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 2:59:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSigner, IXyoSignature } from '@xyo-network/signing'
import { XyoBase } from '@xyo-network/base'
import { XyoEcdsaSecp256k1UnCompressedPublicKey } from './xyo-ecdsa-secp256k1-uncompressed-public-key'

export class XyoEcdsaSecp256k1Signer extends XyoBase implements IXyoSigner {

  constructor (
    private readonly sign: (data: Buffer) => Promise<IXyoSignature>,
    private readonly getPublicXY: () => {x: Buffer, y: Buffer},
    private readonly getPrivateKey: () => string
  ) {
    super()
  }

  /**
   * Signs the data blob with private key
   *
   * @param data An arbitrary data-blob to sign
   */

  public signData(data: Buffer): Promise<IXyoSignature> {
    return this.sign(data)
  }

  /**
   * Returns the public key of this crypto key pair
   */

  get publicKey (): XyoEcdsaSecp256k1UnCompressedPublicKey {
    const { x, y } = this.getPublicXY()
    return new XyoEcdsaSecp256k1UnCompressedPublicKey(x, y)
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
