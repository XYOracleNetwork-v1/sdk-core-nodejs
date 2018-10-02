/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 3rd October 2018 5:03:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:22:11 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../xyo-signature';
import { XyoObject } from '../../components/xyo-object';
import { XyoRsaShaSigner } from './xyo-rsa-sha-signer';

export interface XyoRsaShaSignerFactory {
  newInstance(
    getSignature: (data: Buffer) => Buffer,
    getModulus: () => Buffer,
    verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>,
    getPrivateKey: () => any
  ): XyoRsaShaSigner;
}
