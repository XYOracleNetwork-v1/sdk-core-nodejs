/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 9:53:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-uncompressed-ec-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 4th October 2018 1:10:17 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../components/xyo-object';

/**
 * Sharing public keys is an integral part of the Xyo protocol
 * This particular class is for representing an uncompressed version
 * Ec public key
 */

export abstract class XyoEcdsaUncompressedPublicKey extends XyoObject {
  public abstract x: Buffer;
  public abstract y: Buffer;
}
