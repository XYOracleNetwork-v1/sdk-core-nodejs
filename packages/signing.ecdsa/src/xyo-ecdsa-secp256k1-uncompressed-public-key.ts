/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:11:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-secp256k1-uncompressed-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 3:44:47 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoEcdsaUncompressedPublicKey } from "./xyo-ecdsa-uncompressed-public-key"
import { writePointTo32ByteBuffer } from "@xyo-network/buffer-utils"

export class XyoEcdsaSecp256k1UnCompressedPublicKey extends XyoEcdsaUncompressedPublicKey {

  constructor (
    private readonly xCoordinate: Buffer,
    private readonly yCoordinate: Buffer,
    public readonly schemaObjectId: number
  ) {
    super()
  }

  public getReadableName(): string {
    return 'ecdsa-secp256k1-uncompressed-public-key'
  }

  public getReadableValue() {
    return {
      x: this.x,
      y: this.y
    }
  }

  get x (): Buffer {
    return writePointTo32ByteBuffer(this.xCoordinate)
  }

  get y (): Buffer {
    return writePointTo32ByteBuffer(this.yCoordinate)
  }
}
