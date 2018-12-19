/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 12:07:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hashing-test-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 12:14:17 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHashProvider } from './@types'
import { IXyoSerializationService } from '@xyo-network/serialization'

export function hashSpec(hashProvider: IXyoHashProvider, serializationService: IXyoSerializationService) {

  describe(hashProvider.constructor.name, () => {
    it(`Should verify correct hashes and not verify incorrect hashes`, async () => {
      const dataToHash = Buffer.from(`hello world`)
      const hash = await hashProvider.createHash(dataToHash)

      const correctResult = await hash.verifyHash(dataToHash)
      expect(correctResult).toBe(true)

      const incorrectResult = await hash.verifyHash(Buffer.from('fee phi pho fum'))
      expect(incorrectResult).toBe(false)
    })

    it(`Should have deterministic hashes`, async () => {
      const dataToHash = Buffer.from(`hello world`)
      const hash1 = await hashProvider.createHash(dataToHash)
      const hash2 = await hashProvider.createHash(dataToHash)
      expect(hash1.isEqual(hash2)).toBe(true)
    })

    it(`XyoHashes should serialize/deserialize`, async () => {
      const dataToHash = Buffer.from(`hello world`)
      const hash1 = await hashProvider.createHash(dataToHash)
      const serializedHash1 = hash1.serialize()
      const hash2 = serializationService.deserialize(serializedHash1)
      expect(hash1.isEqual(hash2)).toBe(true)
    })

    it(`Should have different outputs for very-close inputs`, async () => {
      const dataToHash = Buffer.from(`hello world`)
      const hash1 = await hashProvider.createHash(dataToHash)

      const dataToHash2 = Buffer.from(`Hello world`) // with capital H
      const hash2 = await hashProvider.createHash(dataToHash2)
      expect(hash1.isEqual(hash2)).toBe(false)
    })
  })
}
