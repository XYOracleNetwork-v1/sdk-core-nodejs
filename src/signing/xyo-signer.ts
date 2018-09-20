/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 4th September 2018 9:24:06 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 9:33:54 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../components/xyo-object';

/**
 * An XyoSigner provides crypto functionality to be used
 * in signing data and sharing public keys in the xyo protocol
 */

export abstract class XyoSigner extends XyoObject {

  /**
   * Subclasses will return the publicKey of the crypto key pair
   */

  public abstract publicKey: XyoObject;

  /**
   * This should return the private key
   */

  public abstract privateKey: any;

  /**
   * Signs an arbitrary data blob
   *
   * @param data An arbitrary data blob to sign
   * @returns An xyo signature
   */

  public abstract signData(data: Buffer): Promise<XyoObject>;
}
