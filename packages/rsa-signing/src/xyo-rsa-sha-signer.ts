/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:29:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 3:40:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { XyoRsaPublicKey } from './xyo-rsa-public-key'
import { IXyoSigner, IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { XyoRsaSignature } from './rsa-signature'

/**
 * A service for signing using RSASha. This particular class
 * encapsulates a crypto key-pair
 */

export class XyoRsaShaSigner extends XyoBase implements IXyoSigner {

  constructor (
    public readonly getSignature: (data: Buffer) => Buffer,
    public readonly getModulus: () => Buffer,
    public readonly getPrivateKey: () => string,
    public readonly verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey) => Promise<boolean>
  ) {
    super()
  }

  /**
   * Signs a piece of data
   *
   * @param data An arbitrary data blob
   */

  public async signData(data: Buffer): Promise <IXyoSignature> {
    const rawSignature = this.getSignature(data)
    return new XyoRsaSignature(rawSignature, this.verifySign.bind(this))
  }

  /**
   * Returns the publicKey for this crypto-key-pair. In RSA
   * this is just the modulus
   */

  get publicKey(): XyoRsaPublicKey {
    const modulus = this.getModulus()
    return new XyoRsaPublicKey(modulus)
  }

  get privateKey(): string {
    return this.getPrivateKey()
  }
}
