/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:26:17 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 3:37:31 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import NodeRSA from 'node-rsa'

import { IXyoSignerProvider, IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { XyoRsaPublicKey } from './xyo-rsa-public-key'
import { XyoRsaShaSigner } from './xyo-rsa-sha-signer'
import { XyoBase } from '@xyo-network/base'

/**
 * A service for providing RSA-SHA-256 signing services
 */

export class XyoRsaShaSignerProvider extends XyoBase implements IXyoSignerProvider {

  constructor (
    private readonly signingScheme: 'pkcs1-sha1' | 'pkcs1-sha256',
    private readonly rsaSignatureObjectSchemaId: number
  ) {
    super()
  }

  /**
   * Returns a new instance of an rsa-signer
   */

  public newInstance(fromPrivateKey?: any): XyoRsaShaSigner {
    let key: NodeRSA

    if (fromPrivateKey) {
      key = new NodeRSA(fromPrivateKey, 'pkcs8-private-pem')
      key.setOptions({ signingScheme: this.signingScheme })
    } else {
      key = new NodeRSA({ b: 2048 })
      key.setOptions({ signingScheme: this.signingScheme })
    }

    return new XyoRsaShaSigner(
      // getSignature
      (data: Buffer) => key.sign(data),

      // public key
      () => key.exportKey('components-public').n,

      // private key
      () => key.exportKey('pkcs8-private-pem'),

      // verify signature
      this.verifySign.bind(this),

      // The id of the schema
      this.rsaSignatureObjectSchemaId
    )
  }

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */

  public async verifySign(signature: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey): Promise<boolean> {
    const rsaPubKey = publicKey as XyoRsaPublicKey
    const key = new NodeRSA()
    key.setOptions({ signingScheme: this.signingScheme })
    key.importKey({
      n: rsaPubKey.modulus,
      e: rsaPubKey.publicExponent
    })
    return key.verify(data, signature.encodedSignature)
  }
}
