/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:10:57 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 20th September 2018 2:15:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSignature } from '../components/signing/xyo-signature';
import { XyoObject } from '../components/xyo-object';
import { XyoSignerProvider } from './xyo-signer-provider';
import { ec as EC, EllipticKey } from 'elliptic';
import { XyoEcSecp256k } from '../components/signing/algorithms/ecc/xyo-ec-secp-256k';
import { XyoHashProvider } from '../hash-provider/xyo-hash-provider';

const ec = new EC('secp256k1');

/**
 * A service for providing EcSecp256k signing services
 */

export class XyoEcSecp256kSignerProvider implements XyoSignerProvider {

  constructor (
    private readonly hashProvider: XyoHashProvider,
    private readonly signerMajor: number,
    private readonly signerMinor: number,
    private readonly signatureMajor: number,
    private readonly signatureMinor: number,
  ) {}

  /**
   * Returns a new instance of a signer
   */

  public newInstance(fromHexKey: string) {
    let key: EllipticKey;

    if (fromHexKey) {
      const privateKey = ec.keyFromPrivate(fromHexKey, 'hex');
      const correspondingPublicKey = privateKey.getPublic();
      privateKey._importPublic(correspondingPublicKey);
      key = privateKey;
    } else {
      key = ec.genKeyPair();
    }

    return new XyoEcSecp256k(
      // getSignature
      this.getSignFn(key).bind(this),

      // getPublicXY
      () => {
        const publicKey = key.getPublic();
        return {
          x: publicKey.x.toBuffer(),
          y: publicKey.y.toBuffer(),
        };
      },

      // verifySign
      () => this.verifySign.bind(this),

      // getPrivateKey
      () => {
        return key.getPrivate('hex');
      },
      Buffer.from([this.signerMajor, this.signerMinor]),
      Buffer.from([this.signatureMajor, this.signatureMinor])
    );
  }

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */

  public async verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean> {
    return true; // TODO BIG TODO
  }

  private getSignFn(key: EllipticKey) {
    return async (data: Buffer) => {
      const xyoHash = await this.hashProvider.createHash(data);
      const signature = key.sign(xyoHash.hash);
      return Buffer.concat([signature.r.toBuffer(), signature.s.toBuffer()]);
    };
  }
}
