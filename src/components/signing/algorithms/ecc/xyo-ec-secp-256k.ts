/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th September 2018 1:11:06 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ec-secp-256k.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 1:49:45 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoUncompressedEcPublicKey } from './xyo-uncompressed-ec-public-key';
import { XyoObject } from '../../../xyo-object';
import { XyoEcdsaSignature } from './xyo-ecdsa-signature';
import { XyoSigner } from '../../../../signing/xyo-signer';
import { XyoSignature } from '../../xyo-signature';

export class XyoEcSecp256k extends XyoSigner {

  constructor(
    private readonly getSignature: (data: Buffer) => Promise<Buffer>,
    public readonly getPublicXY: () => {x: Buffer, y: Buffer},
    private readonly verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>,
    private readonly getPrivateKey: () => string,
    rawId: Buffer,
    private readonly rawEcdsaSignatureId: Buffer
  ) {
    super(rawId[0], rawId[1]);
  }

  /**
   * Returns the public key of this crypto key pair
   */

  get publicKey () {
    const { x, y } = this.getPublicXY();
    return new XyoUncompressedEcPublicKey(x, y, Buffer.from([0x04, 0x01]));
  }

  get privateKey (): string {
    return this.getPrivateKey();
  }

  /**
   * Signs the data blob with private key
   *
   * @param data An arbitrary data-blob to sign
   */

  public async signData(data: Buffer): Promise<XyoObject> {
    const rawSignature = await this.getSignature(data);
    return new XyoEcdsaSignature(rawSignature, this.rawEcdsaSignatureId, this.verifySign);
  }
}
