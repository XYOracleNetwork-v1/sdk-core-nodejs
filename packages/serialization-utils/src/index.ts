/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 5:27:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 3:33:14 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSerializableObject } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'

export function typedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
  return {
    schemaObjectId: schema.typedSet.id,
    serialize: () => {
      if (tCollection.length === 0) {
        return Buffer.alloc(0)
      }
      return tCollection
    }
  }
}

export function untypedArrayOf<T extends IXyoSerializableObject>(tCollection: T[]): IXyoSerializableObject {
  return {
    schemaObjectId: schema.untypedSet.id,
    serialize: () => {
      if (tCollection.length === 0) {
        return Buffer.alloc(0)
      }
      return tCollection
    }
  }
}
