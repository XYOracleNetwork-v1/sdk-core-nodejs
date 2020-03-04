import { XyoBuffer } from '../xyo-buffer'

describe('XyoBuffer', () => {
  it('Same as input', () => {
    const inputBuffer = Buffer.from('1337')
    const buffer = new XyoBuffer(inputBuffer)
    const outputBuffer = buffer.getContentsCopy()

    expect(outputBuffer).toBe(outputBuffer)
  })

  it('1 as size', () => {
    const inputBuffer = Buffer.from('1337', 'hex')
    const expected = Buffer.from('37', 'hex')
    const buffer = new XyoBuffer(inputBuffer, 1, 2)
    const outputBuffer = buffer.getContentsCopy()

    expect(outputBuffer.values).toBe(expected.values)
  })

  it('Cut start', () => {
    const inputBuffer = Buffer.from('13370001', 'hex')
    const expected = Buffer.from('0001', 'hex')
    const buffer = new XyoBuffer(inputBuffer, 2, 4)
    const outputBuffer = buffer.getContentsCopy()

    expect(outputBuffer.values).toBe(expected.values)
  })

  it('Cut end', () => {
    const inputBuffer = Buffer.from('13370001', 'hex')
    const expected = Buffer.from('1337', 'hex')
    const buffer = new XyoBuffer(inputBuffer, 0, 2)
    const outputBuffer = buffer.getContentsCopy()

    expect(outputBuffer.values).toBe(expected.values)
  })

  it('Get int 8', () => {
    const inputBuffer = Buffer.from('00ff00', 'hex')
    const buffer = new XyoBuffer(inputBuffer)

    expect(buffer.getUInt8(1)).toBe(0xff)
  })
})
