/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:10:57 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:19:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaShaSignerProvider } from '../xyo-rsa-sha-signer-provider';
import { XyoRsaSha256Signer } from './xyo-rsa-sha256-signer';

/**
 * A service for providing RSA-SHA-256 signing services
 */

export class XyoRsaSha256SignerProvider extends XyoRsaShaSignerProvider {
  constructor () {
    super('pkcs1-sha256', { newInstance: (
      getSignature,
      getModulus,
      verifySign,
      getPrivateKey
    ) => new XyoRsaSha256Signer(getSignature, getModulus, verifySign, getPrivateKey) });
  }
}
