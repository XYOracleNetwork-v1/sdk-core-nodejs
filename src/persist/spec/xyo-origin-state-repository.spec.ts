import { IXyoOriginStateRepository } from '../xyo-origin-state-repository'
import { XyoStructure, XyoSchema, XyoBuffer } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../../schema'
import { XyoFileOriginStateRepository } from '../xyo-file-origin-state-repository'

function testOriginStateRepository(repo: IXyoOriginStateRepository) {
  describe('IXyoOriginStateRepository interface', () => {
    it('Should validate', async () => {
      const testIndex0 = XyoStructure.newInstance(XyoObjectSchema.INDEX, XyoBuffer.wrapBuffer(Buffer.from('00')))
      const testIndex1 = XyoStructure.newInstance(XyoObjectSchema.INDEX, XyoBuffer.wrapBuffer(Buffer.from('01')))

      const testPreviousHash0 = XyoStructure.newInstance(XyoObjectSchema.PREVIOUS_HASH, XyoBuffer.wrapBuffer(Buffer.from('00')))
      const testPreviousHash1 = XyoStructure.newInstance(XyoObjectSchema.PREVIOUS_HASH, XyoBuffer.wrapBuffer(Buffer.from('01')))

      repo.putIndex(testIndex0)
      repo.putPreviousHash(testPreviousHash0)

      expect(repo.getPreviousHash()!.getContents().getContentsCopy().toString('hex')).toBe(testPreviousHash0!.getContents().getContentsCopy().toString('hex'))
      expect(repo.getIndex()!.getContents().getContentsCopy().toString('hex')).toBe(testIndex0!.getContents().getContentsCopy().toString('hex'))

      await repo.commit()

      repo.putIndex(testIndex1)
      repo.putPreviousHash(testPreviousHash1)

      expect(repo.getPreviousHash()!.getContents().getContentsCopy().toString('hex')).toBe(testPreviousHash1!.getContents().getContentsCopy().toString('hex'))
      expect(repo.getIndex()!.getContents().getContentsCopy().toString('hex')).toBe(testIndex1!.getContents().getContentsCopy().toString('hex'))

    })
  })
}

const path = './test-state.json'
const repo =  new XyoFileOriginStateRepository(path)
testOriginStateRepository(repo)
