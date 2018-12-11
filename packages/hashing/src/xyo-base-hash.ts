/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 4:18:17 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th December 2018 11:06:36 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHash } from "./@types"
import { XyoBaseSerializable } from '@xyo-network/serialization'

export abstract class XyoBaseHash extends XyoBaseSerializable implements IXyoHash {
  public abstract getHash(): Buffer
  public abstract verifyHash(data: Buffer): Promise<boolean>

  public getData(): Buffer {
    return this.getHash()
  }
}
