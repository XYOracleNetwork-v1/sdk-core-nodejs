/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:03:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 5:29:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../components/xyo-object';
import { XyoRsaPublicKey } from './xyo-rsa-public-key';
import { XyoSigner } from '../xyo-signer';

/**
 * A service for signing using RSASha. This particular class
 * encapsulates a crypto keypair. However it delegates all the
 * public interface methods to services that actually provide the
 * crypto functionality.
 */

export abstract class XyoRsaShaSigner extends XyoObject implements XyoSigner {

  public abstract readonly getSignature: (data: Buffer) => Buffer;
  public abstract readonly getModulus: () => Buffer;
  public abstract getPrivateKey(): any;

  /**
   * Signs a piece of data
   *
   * @param data An arbitrary data blob
   */

  public abstract signData(data: Buffer): Promise<XyoObject>;

  /**
   * Returns the publicKey for this crypto-key-pair. In RSA
   * this is just the modulus
   */

  get publicKey() {
    const modulus = this.getModulus();
    return new XyoRsaPublicKey(modulus);
  }

  get privateKey () {
    return this.getPrivateKey();
  }
}
