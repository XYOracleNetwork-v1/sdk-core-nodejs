/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:49:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-signer.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 4:22:28 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ICryptoSigner } from '../types/crypto-signer';
import NodeRSA from 'node-rsa';

/**
 * This CryptoSigner implements the `ICryptoSigner` using RSA-2048
 */
export class CryptoSigner implements ICryptoSigner {

  /** Leverage NodeRSA for RSA services */
  private readonly key: NodeRSA = new NodeRSA({ b: 2048 });

  /**
   * Returns a byte-representation of the public-key
   */
  public getPublicKey(): Buffer {
    return this.key.exportKey('components-public').n;
  }

  /**
   * Signs data with private key. Returns byte-representation of signature
   *
   * @param data The data to sign
   */

  public sign(data: Buffer): Promise<Buffer> {
    return Promise.resolve(this.key.sign(data));
  }

  /**
   * Verifies a valid signature for the internal keyset for this data, signature
   *
   * @param data The data to have been signed
   * @param signature The signature corresponding to the data
   * @returns Returns true if the signature is valid, false otherwise
   */

  public async verify(data: Buffer, signature: Buffer): Promise<boolean> {
    return Promise.resolve(this.key.verify(data, signature));
  }

  /**
   * Encrypts the provided data with the public key
   *
   * @param data The data to be encrypted
   * @returns The encrypted data as a byte-representation
   */

  public encrypt(data: Buffer): Promise<Buffer> {
    return Promise.resolve(this.key.encrypt(data));
  }

  /**
   * Decrypts the provided data with the private key
   *
   * @param data The encrypted data
   * @returns The un-encrypted data as a byte-representation
   */

  public decrypt(data: Buffer): Promise<Buffer> {
    return Promise.resolve(this.key.decrypt(data));
  }
}
