/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 10:29:47 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-secp256k1-compressed-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:22:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoUncompressedEcPublicKey, XyoUncompressedEcPublicKeyCreator } from './xyo-uncompressed-ec-public-key';
import { XyoResult } from '../../../xyo-result';

// tslint:disable-next-line:max-classes-per-file
export abstract class XyoSecp256K1CompressedPublicKey extends XyoUncompressedEcPublicKey {

  public static creator = new XyoUncompressedEcPublicKeyCreator(0x01);

  get id() {
    return XyoResult.withValue(this.rawId);
  }
}
