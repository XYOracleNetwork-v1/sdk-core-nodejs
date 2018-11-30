/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:47:19 pm
 * @Email:  developer@xyfindables.com
 * @Filename: typedArrayOf.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 2:02:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from "../@types"

const SCHEMA_ID_TYPED_SET = 0xCC

export function typedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
  return {
    schemaObjectId: SCHEMA_ID_TYPED_SET,
    serialize: () => {
      if (tCollection.length === 0) {
        return Buffer.alloc(0)
      }
      return tCollection
    }
  }
}
