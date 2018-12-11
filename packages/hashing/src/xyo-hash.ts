/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 9:59:58 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 10:00:26 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseHash } from "./xyo-base-hash"
import { IXyoHash, IXyoHashProvider } from "./@types"

export class XyoHash extends XyoBaseHash implements IXyoHash {

  constructor(
    private readonly hash: Buffer,
    private readonly hashProvider: IXyoHashProvider,
    public readonly schemaObjectId: number
  ) {
    super()
  }

  public getHash() {
    return this.hash
  }

  public async verifyHash(data: Buffer): Promise<boolean> {
    const dataHash = await this.hashProvider.createHash(data)
    return dataHash.getHash().equals(this.hash)
  }
}
