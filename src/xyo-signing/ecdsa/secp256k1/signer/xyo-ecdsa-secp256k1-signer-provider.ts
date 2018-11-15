/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 18th September 2018 1:10:57 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha256-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:56:24 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject, IXyoObject } from '../../../../xyo-core-components/xyo-object';
import { IXyoSignerProvider, IXyoSignature } from '../../../../@types/xyo-signing';
import { ec as EC, EllipticKey } from 'elliptic';
import { XyoEcdsaSecp256k1Signer } from './xyo-ecdsa-secp256k1-signer';
import { IXyoHashProvider } from '../../../../@types/xyo-hashing';
import { XyoEcdsaUncompressedPublicKey } from '../../uncompressed-public-key/xyo-ecdsa-uncompressed-public-key';

const ec = new EC('secp256k1');

/**
 * A service for providing EcSecp256k signing services
 */

export abstract class XyoEcdsaSecp256k1SignerProvider extends XyoObject implements IXyoSignerProvider {

  public abstract hashProvider: IXyoHashProvider;

  public abstract getSigner(
    sign: (data: Buffer) => Promise<Buffer>,
    getPublicXY: () => {x: Buffer, y: Buffer},
    verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoObject) => Promise<boolean>,
    getPrivateKey: () => string
  ): XyoEcdsaSecp256k1Signer;

  /**
   * Returns a new instance of a signer
   */

  public newInstance(fromHexKey?: string) {
    let key: EllipticKey;

    if (fromHexKey) {
      const privateKey = ec.keyFromPrivate(fromHexKey, 'hex');
      const correspondingPublicKey = privateKey.getPublic();
      privateKey._importPublic(correspondingPublicKey);
      key = privateKey;
    } else {
      key = ec.genKeyPair();
    }

    return this.getSigner(
      this.getSignFn(key).bind(this),
      () => {
        const publicKey = key.getPublic();
        return {
          x: publicKey.x.toBuffer(),
          y: publicKey.y.toBuffer(),
        };
      },
      this.verifySign.bind(this),
      () => {
        return key.getPrivate('hex');
      }
    );
  }

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */

  public async verifySign(signature: IXyoSignature, data: Buffer, publicKey: IXyoObject): Promise<boolean> {
    const hashedData = await this.hashProvider.createHash(data);
    const uncompressedEcPublicKey = publicKey as XyoEcdsaUncompressedPublicKey;
    const x = uncompressedEcPublicKey.x.toString('hex');
    const y = uncompressedEcPublicKey.y.toString('hex');
    const hexKey = ['04', x, y].join('');
    const key = ec.keyFromPublic(hexKey, 'hex');
    return key.verify(hashedData.hash, this.buildDER(signature.encodedSignature));
  }

  private getSignFn(key: EllipticKey) {
    return async (data: Buffer) => {
      const xyoHash = await this.hashProvider.createHash(data);
      const signature = key.sign(xyoHash.hash);
      const rBuffer = signature.r.toBuffer();
      const sBuffer = signature.s.toBuffer();

      return Buffer.concat([
        Buffer.from([rBuffer.length]),
        rBuffer,
        Buffer.from([sBuffer.length]),
        sBuffer
      ]);
    };
  }

  private buildDER(xyBuffer: Buffer) {
    const sizeOfR = xyBuffer.readUInt8(0);
    const rBuffer = xyBuffer.slice(1, sizeOfR + 1);

    const source = Buffer.concat([
      Buffer.from([0x02]),
      xyBuffer.slice(0, 1),
      rBuffer,
      Buffer.from([0x02]),
      xyBuffer.slice(sizeOfR + 1),
    ]);

    const sourceBufferSizeBuffer = Buffer.alloc(1);
    sourceBufferSizeBuffer.writeUInt8(source.length, 0);
    return new Uint8Array(Buffer.concat([
      Buffer.from([0x30]),
      sourceBufferSizeBuffer,
      source
    ]));
  }
}
