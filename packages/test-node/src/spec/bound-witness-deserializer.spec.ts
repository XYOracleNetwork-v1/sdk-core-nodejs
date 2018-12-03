/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 3:03:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness-deserializer.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 1:19:17 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializationService } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'
import { XyoRecipes } from '../xyo-serialization-recipes'

// tslint:disable-next-line:max-line-length
const hex = `a0020000004aa00100000011a0010000000b800e0000000500b0cc0000001eb00700000018a0010000000e8003000000080000000000000004a00100000011a0010000000b800b0000000500`
describe(`BoundWitness Deserialization`, () => {
  it(`Should deserialize without error`, () => {

    const bytes = Buffer.from(hex, 'hex')
    // @ts-ignore
    const serializationService = new XyoSerializationService(schema, new XyoRecipes(undefined).getRecipes())
    const result = serializationService.deserialize(bytes)
    console.log(result)
  })
  // it(`Should deserialize without error`, () => {
  //   const bytes = Buffer.from([0xa0, 0x01, 0x00, 0x00, 0x00, 0x04])
  //   const serializationService = new XyoSerializationService(schema, recipes)
  //   const result = serializationService.deserialize(bytes)
  // })
})
