/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:49:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-signer.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 1:59:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ICryptoSigner } from '../types/crypto-signer';
import { XYOBase } from './xyo-base.abstract-class';

export class CryptoSigner extends XYOBase implements ICryptoSigner {

  constructor(privateKey?: Buffer | undefined) {
    super();
    return this;
  }

  public getPublicKey(): Buffer {
    throw new Error('Method not implemented.');
  }

  public sign(data: Buffer): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }

  public verify(data: Buffer, signature: Buffer, publicKey: Buffer): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public encrypt(data: Buffer): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }

  public decrypt(data: Buffer): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }

  public getMajor(): number {
    throw new Error('Method not implemented.');
  }

  public getMinor(): number {
    throw new Error('Method not implemented.');
  }
}
