/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 4:18:17 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 26th November 2018 4:22:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHash } from "./@types"

export abstract class XyoBaseHash implements IXyoHash {
  public abstract schemaObjectId: number
  public abstract getHash(): Buffer
  public abstract verifyHash(data: Buffer): Promise<boolean>

  public serialize(): Buffer {
    return this.getHash()
  }

}
