/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:03:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 2:03:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoRSASha256Signature } from '../components/signing/algorithms/rsa/xyo-rsa-sha256-signature';
import { XyoObject } from '../components/xyo-object';
import { XyoSignature } from '../components/signing/xyo-signature';
import { XyoRsaPublicKey } from '../components/signing/algorithms/rsa/xyo-rsa-public-key';
import { XyoSigner } from './xyo-signer';

/**
 * A service for signing using RSASha256. This particular class
 * encapsulates a crypto keypair. However it delegates all the
 * public interface methods to services that actually provide the
 * crypto functionality.
 */

export class XyoRSASha256Signer implements XyoSigner {

  /**
   * Creates a new instance of XyoRSASha256Signer
   *
   * @param getSignature A signature-provider function
   * @param getModulus A modulus-provider function
   * @param verifySign A signature verification function
   */

  constructor (
    private readonly getSignature: (data: Buffer) => Buffer,
    private readonly getModulus: () => Buffer,
    private readonly verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>
  ) {}

  /**
   * Signs a piece of data
   *
   * @param data An arbitrary data blob
   */

  public async signData(data: Buffer): Promise<XyoObject> {
    const rawSignature = this.getSignature(data);
    return new XyoRSASha256Signature(rawSignature, this.verifySign);
  }

  /**
   * Returns the publicKey for this crypto-key-pair. In RSA
   * this is just the modulus
   */

  get publicKey() {
    const modulus = this.getModulus();
    return new XyoRsaPublicKey(modulus);
  }
}
