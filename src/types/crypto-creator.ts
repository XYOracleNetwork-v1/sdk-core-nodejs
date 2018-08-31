/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:34:33 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-creator.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 4:21:41 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ICryptoSigner } from './crypto-signer';

export interface ICryptoCreator {
  getSigner(privateKey?: Buffer): ICryptoSigner;
}
