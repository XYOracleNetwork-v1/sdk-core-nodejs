/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 12:15:01 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-sha256.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 26th February 2019 12:46:52 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { hashSpec } from '../xyo-hashing-test-utils'
import { XyoNativeBaseHashProvider } from '../xyo-native-base-hash-provider'
import { XyoSha3HashProvider } from '../xyo-sha3-hash-provider'
import { XyoSerializationService } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'

describe('Sha256 Hash', () => {
  const serializationService = new XyoSerializationService(schema)
  const sha256HashProvider = new XyoNativeBaseHashProvider('sha256', schema.sha256Hash.id)
  hashSpec(sha256HashProvider, serializationService)
})

describe('Sha3 Hash', () => {
  const serializationService = new XyoSerializationService(schema)
  const sha3HashProvider = new XyoSha3HashProvider()
  hashSpec(sha3HashProvider, serializationService)
})
