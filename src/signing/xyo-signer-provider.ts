/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 12:53:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 4:36:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSigner } from './xyo-signer';
import { XyoSignature } from '../components/signing/xyo-signature';
import { XyoObject } from '../components/xyo-object';

/**
 * A factory for creating new XyoSigners and a service for verifying signatures
 */

export interface XyoSignerProvider {
  /**
   * Returns a new instance of a signer
   */
  newInstance(fromPrivateKey?: any): XyoSigner;

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */
  verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean>;
}
