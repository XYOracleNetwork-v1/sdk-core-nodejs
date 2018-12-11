/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 1:22:08 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-simple-cache.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 1:25:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ISimpleCache } from "./@types"

export class XyoSimpleCache implements ISimpleCache {
  private readonly cache: {[s: string]: any} = {}

  public getOrCreate<T>(name: string, initializer: () => T): T {
    if (this.cache[name]) {
      return this.cache[name] as T
    }

    const t = initializer()
    this.cache[name] = t
    return t
  }
}
