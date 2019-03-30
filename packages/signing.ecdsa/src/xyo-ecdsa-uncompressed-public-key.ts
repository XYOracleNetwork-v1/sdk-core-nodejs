/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:12:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-uncompressed-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:32:34 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoPublicKey } from '@xyo-network/signing'
import { writePointTo32ByteBuffer } from '@xyo-network/buffer-utils'
import { XyoBaseSerializable } from '@xyo-network/serialization'

/**
 * Sharing public keys is an integral part of the Xyo protocol
 * This particular class is for representing an uncompressed version
 * Ec public key
 */

export abstract class XyoEcdsaUncompressedPublicKey extends XyoBaseSerializable implements IXyoPublicKey {

  public abstract schemaObjectId: number
  public abstract x: Buffer
  public abstract y: Buffer

  public getRawPublicKey() {
    return Buffer.concat([
      writePointTo32ByteBuffer(this.x),
      writePointTo32ByteBuffer(this.y)
    ])
  }

  public getData(): Buffer {
    return this.getRawPublicKey()
  }
}
