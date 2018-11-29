/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:48:04 pm
 * @Email:  developer@xyfindables.com
 * @Filename: untypedArrayOf.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 2:03:05 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from "../@types"

const SCHEMA_ID_UNTYPED_SET = 0x01

export function untypedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
  return {
    schemaObjectId: SCHEMA_ID_UNTYPED_SET,
    serialize: () => {
      if (tCollection.length === 0) {
        return Buffer.alloc(0)
      }
      return tCollection
    }
  }
}
