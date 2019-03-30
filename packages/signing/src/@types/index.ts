/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 11th December 2018 9:26:03 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 10:07:02 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from '@xyo-network/serialization'

/**
 * Xyo Public key wrapper
 */
export interface IXyoPublicKey extends IXyoSerializableObject {

  /** Returns the raw bytes of the public-key */
  getRawPublicKey(): Buffer
}

/**
 * Xyo Signature Wrapper
 */
export interface IXyoSignature extends IXyoSerializableObject {

  /**
   * Subclasses will return a binary-representation of the signature
   */
  encodedSignature: Buffer

  /**
   * Verifies that this signature is valid
   *
   * @param data The data that was signed
   * @param publicKey The public key associated with the crypto key-pair
   */
  verify (data: Buffer, publicKey: IXyoPublicKey): Promise<boolean>
}

/**
 * Abstraction for an instance of an object that providers signing services
 */
export interface IXyoSigner extends IXyoSerializableObject {

  /**
   * Subclasses will return the publicKey of the crypto key pair
   */
  publicKey: IXyoPublicKey

  /**
   * This should return the private key
   */
  privateKey: any

  /**
   * Signs an arbitrary data blob
   *
   * @param data An arbitrary data blob to sign
   * @returns An xyo signature
   */
  signData(data: Buffer): Promise<IXyoSignature>
}

/**
 * Provides new instances of xyo-signers
 */
export interface IXyoSignerProvider {
  /**
   * Returns a new instance of a signer
   */
  newInstance(fromPrivateKey?: any): IXyoSigner

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   * @returns Will return true if the signature/public-key matches that data passed in
   */
  verifySign(signature: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey): Promise<boolean>
}
