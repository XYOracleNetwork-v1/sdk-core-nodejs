/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:28:12 pm
 * @Email:  developer@xyfindables.com
 * @Filename: serialize.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:28:37 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { serialize } from '../helpers/serialize'
describe('XyoObjectSchema', () => {
  it('Should serialize value with specified sizeIdentifierSize', () => {
    const buf = Buffer.alloc(1)
    buf.writeUInt8(1, 0)

    const result = serialize(buf, {
      sizeIdentifierSize: 1,
      iterableType: 'not-iterable',
      id: 255
    })

    const expected = Buffer.from([
      0x00,
      0xFF,
      0x02,
      0x01
    ])

    expect(expected.equals(result)).toBe(true)
  })

  it('Should serialize value with dynamic sizeIdentifierSize', () => {
    const buf = Buffer.alloc(2)
    buf.writeUInt16BE(1, 0) // 2 bytes

    const result = serialize(buf, {
      sizeIdentifierSize: null,
      iterableType: 'not-iterable',
      id: 255
    })

    const expected = Buffer.from([
      0x00,
      0xFF,
      0x03,
      0x00,
      0x01
    ])

    expect(expected.equals(result)).toBe(true)
  })

  it('Should serialize value with dynamic sizeIdentifierSize more than one byte', () => {
    const buf = Buffer.alloc(Math.pow(2, 10))
    buf.writeUInt16BE(1, 0) // 2 bytes

    const result = serialize(buf, {
      sizeIdentifierSize: null,
      iterableType: 'not-iterable',
      id: 255
    })

    const header = Buffer.from([
      0b01000000,
      0xFF
    ])

    const sizeBuffer = Buffer.alloc(2)
    sizeBuffer.writeUInt16BE(buf.length + 2, 0)

    const expected = Buffer.concat([
      header,
      sizeBuffer,
      buf
    ])

    expect(expected.equals(result)).toBe(true)
  })

  it('Should set iterable typed bits', () => {
    const buf = Buffer.alloc(1)
    buf.writeUInt8(1, 0)

    const result = serialize(buf, {
      sizeIdentifierSize: 1,
      iterableType: 'iterable-typed',
      id: 255
    })

    const expected = Buffer.from([
      0b00110000,
      0xFF,
      0x02,
      0x01
    ])

    expect(expected.equals(result)).toBe(true)
  })

  it('Should set iterable untyped bits', () => {
    const buf = Buffer.alloc(1)
    buf.writeUInt8(1, 0)

    const result = serialize(buf, {
      sizeIdentifierSize: 1,
      iterableType: 'iterable-untyped',
      id: 255
    })

    const expected = Buffer.from([
      0b00100000,
      0xFF,
      0x02,
      0x01
    ])

    expect(expected.equals(result)).toBe(true)
  })
})
