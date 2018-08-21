/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:49:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-signer.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 21st August 2018 8:45:25 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ICryptoSigner } from '../types/crypto-signer';
import { XYOBase } from './xyo-base.abstract-class';
import NodeRSA from 'node-rsa';

export class CryptoSigner extends XYOBase implements ICryptoSigner {
  private readonly key: NodeRSA;

  constructor () {
    super();
    this.key = new NodeRSA({ b: 2048 });
  }

  public getPublicKey(): Buffer {
    return this.key.exportKey('components-public').n;
  }

  public sign(data: Buffer): Promise<Buffer> {
    return Promise.resolve(this.key.sign(data));
  }

  public async verify(data: Buffer, signature: Buffer): Promise<boolean> {
    return Promise.resolve(this.key.verify(data, signature));
  }

  public encrypt(data: Buffer): Promise<Buffer> {
    return Promise.resolve(this.key.encrypt(data));
  }

  public decrypt(data: Buffer): Promise<Buffer> {
    return Promise.resolve(this.key.decrypt(data));
  }

  public getMajor(): number {
    return 0x99;
  }

  public getMinor(): number {
    return 0x01;
  }
}
