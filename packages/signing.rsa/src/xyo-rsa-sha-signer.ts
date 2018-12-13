/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 3:29:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rsa-sha-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 10:42:49 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { schema } from '@xyo-network/serialization-schema'
import { XyoRsaPublicKey } from './xyo-rsa-public-key'
import { IXyoSigner, IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { XyoRsaSignature } from './rsa-signature'
import { XyoBaseSerializable, IXyoDeserializer } from '@xyo-network/serialization'

/**
 * A service for signing using RSASha. This particular class
 * encapsulates a crypto key-pair
 */

export class XyoRsaShaSigner extends XyoBaseSerializable implements IXyoSigner {

  public static deserializer: IXyoDeserializer<XyoRsaShaSigner>
  public readonly schemaObjectId = schema.rsaSigner.id

  constructor (
    public readonly getSignature: (data: Buffer) => Buffer,
    public readonly getModulus: () => Buffer,
    public readonly getPrivateKey: () => string,
    public readonly verifySign: (signature: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey) => Promise<boolean>,
    private readonly rsaSignatureSchemaId: number
  ) {
    super(schema)
  }

  /**
   * Signs a piece of data
   *
   * @param data An arbitrary data blob
   */

  public async signData(data: Buffer): Promise <IXyoSignature> {
    const rawSignature = this.getSignature(data)
    return new XyoRsaSignature(rawSignature, this.verifySign.bind(this), this.rsaSignatureSchemaId)
  }

  /**
   * Returns the publicKey for this crypto-key-pair. In RSA
   * this is just the modulus
   */

  get publicKey(): XyoRsaPublicKey {
    const modulus = this.getModulus()
    return new XyoRsaPublicKey(modulus)
  }

  get privateKey(): string {
    return this.getPrivateKey()
  }

  public getReadableValue() {
    return this.privateKey
  }

  public getData(): Buffer {
    return Buffer.from(this.privateKey)
  }
}
