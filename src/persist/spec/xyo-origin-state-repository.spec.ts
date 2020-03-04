/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { IXyoOriginStateRepository } from '../xyo-origin-state-repository'
import { XyoObjectSchema } from '../../schema'
import { XyoFileOriginStateRepository } from '../xyo-file-origin-state-repository'
import { XyoStructure, XyoBuffer } from '../../object-model'

function testOriginStateRepository(repo: IXyoOriginStateRepository) {
  describe('IXyoOriginStateRepository interface', () => {
    it('Should validate', async () => {
      const testIndex0 = XyoStructure.newInstance(
        XyoObjectSchema.INDEX,
        new XyoBuffer(Buffer.from('00'))
      )
      const testIndex1 = XyoStructure.newInstance(
        XyoObjectSchema.INDEX,
        new XyoBuffer(Buffer.from('01'))
      )

      const testPreviousHash0 = XyoStructure.newInstance(
        XyoObjectSchema.PREVIOUS_HASH,
        new XyoBuffer(Buffer.from('00'))
      )
      const testPreviousHash1 = XyoStructure.newInstance(
        XyoObjectSchema.PREVIOUS_HASH,
        new XyoBuffer(Buffer.from('01'))
      )

      repo.putIndex(testIndex0)
      repo.putPreviousHash(testPreviousHash0)

      expect(
        repo
          .getPreviousHash()!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      ).toBe(
        testPreviousHash0!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      )
      expect(
        repo
          .getIndex()!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      ).toBe(
        testIndex0!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      )

      await repo.commit()

      repo.putIndex(testIndex1)
      repo.putPreviousHash(testPreviousHash1)

      expect(
        repo
          .getPreviousHash()!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      ).toBe(
        testPreviousHash1!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      )
      expect(
        repo
          .getIndex()!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      ).toBe(
        testIndex1!
          .getAll()
          .getContentsCopy()
          .toString('hex')
      )
    })
  })
}

const path = './test-state.json'
const repository = new XyoFileOriginStateRepository(path)
testOriginStateRepository(repository)
