/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 9th October 2018 12:08:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signing.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 12th October 2018 10:00:46 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from "../xyo-core-components/xyo-object";
import { IXyoSignature } from './xyo-signing';
import { XyoRsaShaSigner } from "../xyo-signing/rsa/signer/xyo-rsa-sha-signer";

/**
 * A universal public key interface
 */
export interface IXyoPublicKey extends XyoObject {

  /** Returns the raw bytes of the public-key */
  getRawPublicKey(): Buffer;
}

/**
 * A factory for producing new instance of RSA-SHA-X signers
 */
export interface IXyoRsaShaSignerFactory {

  /** Returns a new instance of a signer */
  newInstance(
    getSignature: (data: Buffer) => Buffer,
    getModulus: () => Buffer,
    verifySign: (signature: IXyoSignature, data: Buffer, publicKey: XyoObject) => Promise<boolean>,
    getPrivateKey: () => any
  ): XyoRsaShaSigner;
}

/** A universal interface for XyoSignatures */

export interface IXyoSignature extends XyoObject {

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

/** Provides new instances of xyo-signers */
export interface IXyoSignerProvider {
  /**
   * Returns a new instance of a signer
   */
  newInstance(fromPrivateKey?: any): IXyoSigner;

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */
  verifySign(signature: IXyoSignature, data: Buffer, publicKey: XyoObject): Promise<boolean>;
}

/** A signer can be used to create signatures in the xyo system */
export interface IXyoSigner extends XyoObject {

  /**
   * Subclasses will return the publicKey of the crypto key pair
   */

  publicKey: IXyoPublicKey;

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

  signData(data: Buffer): Promise<IXyoSignature>;
}
