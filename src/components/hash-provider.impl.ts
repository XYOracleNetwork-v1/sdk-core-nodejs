import { IHashProvider } from '../types/hash-provider.interface';

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:32:32 am
 * @Email:  developer@xyfindables.com
 * @Filename: hash-provider.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 9:55:22 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export class HashProvider implements IHashProvider {

  public getMajor(): number {
    throw new Error('Method not implemented.');
  }

  public getMinor(): number {
    throw new Error('Method not implemented.');
  }

  public getCanonicalName(): string {
    throw new Error('Method not implemented.');
  }

  public hash(data: Uint8Array) {
    throw new Error('Method not implemented.');
  }

  public verifyHash(data: Uint8Array, hash: Uint8Array): boolean {
    throw new Error('Method not implemented.');
  }
}
