/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:12:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-uncompressed-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 3:43:58 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { IXyoPublicKey } from '@xyo-network/signing'
import { writePointTo32ByteBuffer } from '@xyo-network/buffer-utils'

/**
 * Sharing public keys is an integral part of the Xyo protocol
 * This particular class is for representing an uncompressed version
 * Ec public key
 */

export abstract class XyoEcdsaUncompressedPublicKey extends XyoBase implements IXyoPublicKey {

  public abstract schemaObjectId: number
  public abstract x: Buffer
  public abstract y: Buffer

  public getRawPublicKey() {
    return Buffer.from([
      writePointTo32ByteBuffer(this.x),
      writePointTo32ByteBuffer(this.y)
    ])
  }

  public serialize(): Buffer {
    return this.getRawPublicKey()
  }
}
