/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:10:57 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 5:10:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRsaShaSignerProvider } from './xyo-rsa-sha-signer-provider';
import { XyoRsaSha1Signer } from './xyo-rsa-sha1-signer';

/**
 * A service for providing RSA-SHA1 signing services
 */

export class XyoRsaSha1SignerProvider extends XyoRsaShaSignerProvider {
  constructor () {
    super('pkcs1-sha1', { newInstance: (
      getSignature,
      getModulus,
      verifySign,
      getPrivateKey
    ) => new XyoRsaSha1Signer(getSignature, getModulus, verifySign, getPrivateKey) });
  }
}
