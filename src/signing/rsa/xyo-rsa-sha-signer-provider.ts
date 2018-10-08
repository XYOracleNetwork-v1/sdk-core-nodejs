/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:10:57 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:23:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../xyo-signature';
import { XyoObject } from '../../components/xyo-object';
import NodeRSA from 'node-rsa';
import { XyoSignerProvider } from '../xyo-signer-provider';
import { XyoRsaPublicKey } from './xyo-rsa-public-key';
import { XyoRsaShaSignerFactory } from './xyo-rsa-types';
import { XyoRsaShaSigner } from './xyo-rsa-sha-signer';
import { XyoBase } from '../../components/xyo-base';

/**
 * A service for providing RSA-SHA-256 signing services
 */

export abstract class XyoRsaShaSignerProvider extends XyoBase implements XyoSignerProvider {

  constructor (
    private readonly signingScheme: 'pkcs1-sha1' | 'pkcs1-sha256',
    private readonly rsaShaSignerFactory: XyoRsaShaSignerFactory
  ) {
    super();
  }

  /**
   * Returns a new instance of a signer
   */

  public newInstance(fromPrivateKey?: any): XyoRsaShaSigner {
    let key: NodeRSA;

    if (fromPrivateKey) {
      key = new NodeRSA(fromPrivateKey, 'pkcs8-private-pem');
      key.setOptions({ signingScheme: this.signingScheme });
    } else {
      key = new NodeRSA({ b: 2048 });
      key.setOptions({ signingScheme: this.signingScheme });
    }

    return this.rsaShaSignerFactory.newInstance(
      // getSignature
      (data: Buffer) => key.sign(data),

      // getModulus
      () => key.exportKey('components-public').n,

      // verifySign
      this.verifySign.bind(this),

      // getPrivateKey
      () => key.exportKey('pkcs8-private-pem')
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
    const rsaPubKey = publicKey as XyoRsaPublicKey;
    const key = new NodeRSA();
    key.setOptions({ signingScheme: this.signingScheme });
    key.importKey({
      n: rsaPubKey.modulus,
      e: rsaPubKey.publicExponent
    });
    return key.verify(data, signature.encodedSignature);
  }
}
