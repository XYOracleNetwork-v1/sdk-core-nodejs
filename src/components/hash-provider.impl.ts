/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Friday, 17th August 2018 9:32:32 am
* @Email:  developer@xyfindables.com
* @Filename: hash-provider.impl.ts
* @Last modified by: ryanxyo
* @Last modified time: Friday, 17th August 2018 11:22:28 am
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import { IHashProvider } from '../types/hash-provider';
import crypto from 'crypto';
import { XyoBase } from './xyo-base.abstract-class';

export class HashProvider extends XyoBase implements IHashProvider {

  public getMajor(): number {
    return 0x55;
  }

  public getMinor(): number {
    return 0x01;
  }

  public async hash(data: Buffer): Promise<Buffer> {
    const hash = crypto.createHash(`sha256`);
    return new Promise((resolve, reject) => {
      hash.on('readable', () => {
        return resolve(hash.read() as Buffer);
      });

      hash.write(data);
      hash.end();
    }) as Promise<Buffer>;
  }

  public async verifyHash(data: Buffer, hash: Uint8Array): Promise<boolean> {
    const actualHash = await this.hash(data);
    return actualHash === hash;
  }
}
