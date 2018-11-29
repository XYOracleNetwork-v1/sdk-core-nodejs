/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:18:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: sliceItem.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:29:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectPartialSchema } from "../@types"
import { getDataBytes } from "./getDataBytes"

export function sliceItem(
  src: Buffer,
  offset: number,
  partialSchema: IXyoObjectPartialSchema,
  includesHeader: boolean
) {
  const partialSlice = offset !== 0 ? src.slice(offset) : src
  const slice = getDataBytes(partialSlice, partialSchema, includesHeader)
  return slice
}
