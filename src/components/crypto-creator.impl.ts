/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:58:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-creator.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:51:13 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ICryptoCreator } from '../types/crypto-creator';
import { ICryptoSigner } from '../types/crypto-signer';
import { CryptoSigner } from './crypto-signer.impl';
import { XyoBase } from './xyo-base.abstract-class';
export class CryptoCreator extends XyoBase implements ICryptoCreator {

  public getSigner(): ICryptoSigner {
    return new CryptoSigner();
  }

  public getMajor(): number {
    throw new Error('Method not implemented.');
  }

  public getMinor(): number {
    throw new Error('Method not implemented.');
  }
}
