/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:34:33 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-creator.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 2:00:58 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXYOBase } from './xyo-base';
import { ICryptoSigner } from './crypto-signer';

export interface ICryptoCreator extends IXYOBase {
  getSigner(privateKey?: Buffer): ICryptoSigner;
}