/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 9th October 2018 12:08:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signing.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:08:14 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from "../xyo-core-components/xyo-object";
import { XyoSignature } from './xyo-signing';
import { XyoRsaShaSigner } from "../xyo-signing/rsa/xyo-rsa-sha-signer";

export interface XyoPublicKey extends XyoObject {
  getRawPublicKey(): Buffer;
}

export interface XyoRsaShaSignerFactory {
  newInstance(
    getSignature: (data: Buffer) => Buffer,
    getModulus: () => Buffer,
    verifySign: (signature: XyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>,
    getPrivateKey: () => any
  ): XyoRsaShaSigner;
}

export interface XyoSignature extends XyoObject {

  /**
   * Subclasses will return a binary-representation of the signature
   */

  encodedSignature: Buffer;

  /**
   * Verifies that this signature is valid
   *
   * @param data The data that was signed
   * @param publicKey The public key associated with the crypto key-pair
   */
  verify (data: Buffer, publicKey: XyoObject): Promise<boolean>;
}

export interface XyoSignerProvider {
  /**
   * Returns a new instance of a signer
   */
  newInstance(fromPrivateKey?: any): XyoSigner;

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */
  verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean>;
}

export interface XyoSigner extends XyoObject {

  /**
   * Subclasses will return the publicKey of the crypto key pair
   */

  publicKey: XyoPublicKey;

  /**
   * This should return the private key
   */

  privateKey: any;

  /**
   * Signs an arbitrary data blob
   *
   * @param data An arbitrary data blob to sign
   * @returns An xyo signature
   */

  signData(data: Buffer): Promise<XyoObject>;
}

/**
 * A factory for creating new XyoSigners and a service for verifying signatures
 */

export interface XyoSignerProvider {
  /**
   * Returns a new instance of a signer
   */
  newInstance(fromPrivateKey?: any): XyoSigner;

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */
  verifySign(signature: XyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean>;
}
