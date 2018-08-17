/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 1:39:22 pm
 * @Email:  developer@xyfindables.com
 * @Filename: crypto-signer.interface.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 1:56:59 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface ICryptoSigner {
  getPublicKey(): Buffer;
  sign(data: Buffer): Promise<Buffer>;
  verify(data: Buffer, signature: Buffer, publicKey: Buffer): Promise<boolean>;
  encrypt(data: Buffer): Promise<Buffer>;
  decrypt(data: Buffer): Promise<Buffer>;
}