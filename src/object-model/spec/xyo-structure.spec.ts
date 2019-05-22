import { XyoStructure } from '../xyo-structure'
import { XyoBuffer } from '../xyo-buffer'
import { XyoSize } from '../xyo-size'
import { XyoSchema } from '../xyo-schema'

describe('XyoBuffer', () => {

  it('1 byte size', () => {
    const inputBuffer = Buffer.from('0055031337', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoStructure(buffer)

    expect(struct.getValue().getContentsCopy().toString('hex')).toBe('1337')
  })

  it('2 byte size', () => {
    const inputBuffer = Buffer.from('405500041337', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoStructure(buffer)

    expect(struct.getValue().getContentsCopy().toString('hex')).toBe('1337')
  })

  it('4 byte size', () => {
    const inputBuffer = Buffer.from('8055000000061337', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoStructure(buffer)

    expect(struct.getValue().getContentsCopy().toString('hex')).toBe('1337')
  })

  it('8 byte size', () => {
    const inputBuffer = Buffer.from('c055000000000000000a1337', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoStructure(buffer)

    expect(struct.getValue().getContentsCopy().toString('hex')).toBe('1337')
  })

  it('Schema test 1', () => {
    const inputBuffer = Buffer.from('0055031337', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = new XyoStructure(buffer)

    expect(struct.getSchema().id).toBe(0x55)
    expect(struct.getSchema().getIsIterable()).toBe(false)
    expect(struct.getSchema().getIsTypedIterable()).toBe(false)
    expect(struct.getSchema().getSizeIdentifier()).toBe(XyoSize.ONE)
  })

  it('Encode 1 byte size', () => {
    const schema = new XyoSchema(0, 0)
    const inputBuffer = Buffer.from('1337', 'hex')
    const buffer = new XyoBuffer(inputBuffer)
    const struct = XyoStructure.newInstance(schema, buffer)

    expect(struct.getAll().getContentsCopy().toString('hex')).toBe('0000031337')
    expect(struct.getValue().getContentsCopy().toString('hex')).toBe('1337')
  })
})
