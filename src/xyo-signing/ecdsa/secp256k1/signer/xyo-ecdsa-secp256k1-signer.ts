/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th September 2018 1:11:06 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ec-secp-256k.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:39:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../../xyo-core-components/xyo-object';
import { IXyoSigner } from '../../../../@types/xyo-signing';
import { XyoEcdsaSecp256k1UnCompressedPublicKey } from '../xyo-ecdsa-secp256k1-uncompressed-public-key';

export abstract class XyoEcdsaSecp256k1Signer extends XyoObject implements IXyoSigner {

  public abstract getPublicXY: () => {x: Buffer, y: Buffer};
  public abstract getPrivateKey: () => string;

  /**
   * Signs the data blob with private key
   *
   * @param data An arbitrary data-blob to sign
   */

  public abstract signData(data: Buffer): Promise<XyoObject>;

  /**
   * Returns the public key of this crypto key pair
   */

  get publicKey () {
    const { x, y } = this.getPublicXY();
    return new XyoEcdsaSecp256k1UnCompressedPublicKey(x, y);
  }

  get privateKey (): string {
    return this.getPrivateKey();
  }
}
