/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:03:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 10:03:02 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-core-components/xyo-object';
import { XyoRsaPublicKey } from '../public-key/xyo-rsa-public-key';
import { IXyoSigner, IXyoSignature } from '../../../@types/xyo-signing';

/**
 * A service for signing using RSASha. This particular class
 * encapsulates a crypto keypair. However it delegates all the
 * public interface methods to services that actually provide the
 * crypto functionality.
 */

export abstract class XyoRsaShaSigner extends XyoObject implements IXyoSigner {

  public abstract readonly getSignature: (data: Buffer) => Buffer;
  public abstract readonly getModulus: () => Buffer;
  public abstract getPrivateKey(): any;

  /**
   * Signs a piece of data
   *
   * @param data An arbitrary data blob
   */

  public abstract signData(data: Buffer): Promise<IXyoSignature>;

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
