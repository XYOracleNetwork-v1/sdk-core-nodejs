/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:58:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-creator.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 3:27:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ICryptoCreator } from '../types/crypto-creator';
import { ICryptoSigner } from '../types/crypto-signer';
import { CryptoSigner } from './crypto-signer.impl';
import { XyoBase } from './xyo-base.abstract-class';

/**
 * A `CryptoCreator` is meant to abstract a `CryptoSigner` is created
 * from the consumer.
 */
export class CryptoCreator extends XyoBase implements ICryptoCreator {

  /**
   * Returns a new instance of an `ICryptoSigner`
   */

  public getSigner(): ICryptoSigner {
    return new CryptoSigner();
  }
}
