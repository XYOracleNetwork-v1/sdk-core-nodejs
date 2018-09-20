/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:10:57 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 4:43:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRSASha256Signer } from './xyo-rsa-sha256-signer';
import { XyoSignature } from '../components/signing/xyo-signature';
import { XyoObject } from '../components/xyo-object';
import NodeRSA from 'node-rsa';
import { XyoSignerProvider } from './xyo-signer-provider';

/**
 * A service for providing RSA-SHA-256 signing services
 */

export class XyoRSASha256SignerProvider implements XyoSignerProvider {

  /**
   * Returns a new instance of a signer
   */

  public newInstance(fromPrivateKey?: any) {
    const key = fromPrivateKey ? new NodeRSA(fromPrivateKey) : new NodeRSA({ b: 2048 });

    return new XyoRSASha256Signer(
      // getSignature
      (data: Buffer) => key.sign(data),

      // getModulus
      () => key.exportKey('components-public').n,

      // verifySign
      this.verifySign,

      // getPrivateKey
      () => key.exportKey('pkcs1-private-pem')
    );
  }

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */

  public async verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean> {
    return true; // TODO BIG TODO
  }
}
