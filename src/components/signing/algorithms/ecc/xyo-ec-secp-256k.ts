/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th September 2018 1:11:06 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ec-secp-256k.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 1:16:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSigner } from '../../xyo-signer';
import { ec as EC } from 'elliptic';
import { XyoUncompressedEcPublicKey } from './xyo-uncompressed-ec-public-key';
import { XyoObject } from '../../../xyo-object';
import { XyoEcdsaSignature } from './xyo-ecdsa-signature';

const ec = new EC('secp256k1');

/**
 * A Signer adhering to the XyoSigner crypto protocols that implements
 * the `sec256k` crypto protocols
 */
export class XyoEcSecp256k extends XyoSigner {

  /**
   * An encapsulation of the crypto public/private key pair
   */
  private key = ec.genKeyPair();

  constructor(private readonly rawEcdsaSignatureId: Buffer) {
    super();
  }

  /**
   * Returns the public key of this crypto key pair
   */

  get publicKey () {
    const pk = this.key.getPublic();
    return new XyoUncompressedEcPublicKey(
      pk.x.toBuffer(),
      pk.y.toBuffer(),
      Buffer.from([0x04, 0x01])
    );
  }

  /**
   * Signs the data blob with private key
   *
   * @param data An arbitrary data-blob to sign
   */

  public signData(data: Buffer): Promise<XyoObject> {
    const signature = this.key.sign(data);
    const rawSignature = Buffer.concat([signature.r.toBuffer(), signature.s.toBuffer()]);
    return Promise.resolve(new XyoEcdsaSignature(rawSignature, this.rawEcdsaSignatureId));
  }
}
