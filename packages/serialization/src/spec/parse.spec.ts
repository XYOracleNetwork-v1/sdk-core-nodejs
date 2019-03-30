/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 10:46:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: parse.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 11:16:10 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { parse } from "../helpers/parse"
import { IParseResult } from "../@types"

describe('Parsing', () => {

  it('Should parse a non-iterable value', () => {
    const src = Buffer.from([
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x01 // value
    ])

    const result = parse(src, {})
    if (!result) {
      throw new Error(`Result should be defined`)
    }

    expect((result.data as Buffer).equals(Buffer.from([0x01]))).toBe(true)
    expect(result.id).toBe(0x16)
    expect(result.sizeIdentifierSize).toBe(1)
    expect(result.iterableType).toBe('not-iterable')
  })

  it('Should parse an iterable-typed value with 1 item', () => {
    const src = Buffer.from([
      0x30,
      0x14,
      0x05,
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x01 // value
    ])

    const result = parse(src, {})
    if (!result) {
      throw new Error(`Result should be defined`)
    }

    expect(result.data).toBeInstanceOf(Array)
    expect(result.id).toBe(0x14)
    expect(result.sizeIdentifierSize).toBe(1)
    expect(result.iterableType).toBe('iterable-typed')

    const innerResult = (result.data as IParseResult[])[0]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x01]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')
  })

  it('Should parse an iterable-untyped value with 1 item', () => {
    const src = Buffer.from([
      0x20,
      0x15,
      0x05,
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x01 // value
    ])

    const result = parse(src, {})
    if (!result) {
      throw new Error(`Result should be defined`)
    }

    expect(result.data).toBeInstanceOf(Array)
    expect(result.id).toBe(0x15)
    expect(result.sizeIdentifierSize).toBe(1)
    expect(result.iterableType).toBe('iterable-untyped')

    const innerResult = (result.data as IParseResult[])[0]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x01]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')
  })

  it('Should parse an iterable-typed value with 3 items', () => {
    const src = Buffer.from([
      0x30,
      0x14,
      0x09,
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x01, // value
      0x02, // 2 bytes
      0x03, // value
      0x02, // 2 bytes
      0x04 // value
    ])

    const result = parse(src, {})
    if (!result) {
      throw new Error(`Result should be defined`)
    }

    expect(result.data).toBeInstanceOf(Array)
    expect(result.id).toBe(0x14)
    expect(result.sizeIdentifierSize).toBe(1)
    expect(result.iterableType).toBe('iterable-typed')

    let innerResult = (result.data as IParseResult[])[0]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x01]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')

    innerResult = (result.data as IParseResult[])[1]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x03]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')

    innerResult = (result.data as IParseResult[])[2]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x04]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')
  })

  it('Should parse an iterable-untyped value with 3 items', () => {
    const src = Buffer.from([
      0x20,
      0x15,
      0x0d,
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x01, // value
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x03, // value
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x04 // value
    ])

    const result = parse(src, {})
    if (!result) {
      throw new Error(`Result should be defined`)
    }

    expect(result.data).toBeInstanceOf(Array)
    expect(result.id).toBe(0x15)
    expect(result.sizeIdentifierSize).toBe(1)
    expect(result.iterableType).toBe('iterable-untyped')

    let innerResult = (result.data as IParseResult[])[0]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x01]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')

    innerResult = (result.data as IParseResult[])[1]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x03]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')

    innerResult = (result.data as IParseResult[])[2]
    expect((innerResult.data as Buffer).equals(Buffer.from([0x04]))).toBe(true)
    expect(innerResult.id).toBe(0x16)
    expect(innerResult.sizeIdentifierSize).toBe(1)
    expect(innerResult.iterableType).toBe('not-iterable')
  })

  it('Should parse an iterable-typed of iterable-untyped values with 1 item', () => {
    const src = Buffer.from([
      0x30,
      0x14,
      0x10,
      0x20,
      0x15,
      0x0d,
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x01, // value
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x03, // value
      0x00, // non-iterable 1 byte size
      0x16, // rssi id
      0x02, // 2 bytes
      0x04 // value
    ])
    const result = parse(src, {})
    if (!result) {
      throw new Error(`Result should be defined`)
    }
    expect(result.data).toBeInstanceOf(Array)
    expect((result.data[0] as IParseResult).data).toBeInstanceOf(Array)
  })
})
