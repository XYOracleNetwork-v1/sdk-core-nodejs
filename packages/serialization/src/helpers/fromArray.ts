/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:48:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: fromArray.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:49:00 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from "../@types"

export function fromArray<T extends IXyoSerializableObject>(s: IXyoSerializableObject): T[] {
  return s.serialize() as T[]
}
