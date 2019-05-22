import { XyoSchema } from '../xyo-schema'
import { XyoSize } from '../xyo-size'

describe('XyoSchema', () => {
  it('Size as 1', () => {
    const schema = new XyoSchema(0xff, 0x20)

    expect(schema.getSizeIdentifier()).toBe(XyoSize.ONE)
  })

  it('Size as 2', () => {
    const schema = new XyoSchema(0xff, 0x60)

    expect(schema.getSizeIdentifier()).toBe(XyoSize.TWO)
  })

  it('Size as 4', () => {
    const schema = new XyoSchema(0xff, 0xa0)

    expect(schema.getSizeIdentifier()).toBe(XyoSize.FOUR)
  })

  it('Size as 8', () => {
    const schema = new XyoSchema(0xff, 0xe0)

    expect(schema.getSizeIdentifier()).toBe(XyoSize.EIGHT)
  })

  it('Iterable flag set', () => {
    const schema = new XyoSchema(0xff, 0x20)

    expect(schema.getIsIterable()).toBe(true)
  })

  it('Iterable flag not set', () => {
    const schema = new XyoSchema(0xff, 0x00)

    expect(schema.getIsIterable()).toBe(false)
  })

  it('Id', () => {
    const schema = new XyoSchema(0x24, 0x00)

    expect(schema.id).toBe(0x24)
  })

  it('Create case 1', () => {
    const schema = XyoSchema.create(0xff, false, false, XyoSize.ONE)

    expect(schema.id).toBe(0xff)
    expect(schema.getIsIterable()).toBe(false)
    expect(schema.getIsTypedIterable()).toBe(false)
    expect(schema.getSizeIdentifier()).toBe(XyoSize.ONE)
  })

  it('Create case 2', () => {
    const schema = XyoSchema.create(0xff, false, false, XyoSize.TWO)

    expect(schema.id).toBe(0xff)
    expect(schema.getIsIterable()).toBe(false)
    expect(schema.getIsTypedIterable()).toBe(false)
    expect(schema.getSizeIdentifier()).toBe(XyoSize.TWO)
  })

  it('Create case 3', () => {
    const schema = XyoSchema.create(0xff, true, true, XyoSize.EIGHT)

    expect(schema.id).toBe(0xff)
    expect(schema.getIsIterable()).toBe(true)
    expect(schema.getIsTypedIterable()).toBe(true)
    expect(schema.getSizeIdentifier()).toBe(XyoSize.EIGHT)
  })

  it('Create case 4', () => {
    const schema = XyoSchema.create(0xff, false, true, XyoSize.FOUR)

    expect(schema.id).toBe(0xff)
    expect(schema.getIsIterable()).toBe(false)
    expect(schema.getIsTypedIterable()).toBe(true)
    expect(schema.getSizeIdentifier()).toBe(XyoSize.FOUR)
  })
})
