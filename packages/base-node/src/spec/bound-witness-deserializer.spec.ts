/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 29th November 2018 3:03:18 pm
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness-deserializer.spec.ts
 
 * @Last modified time: Wednesday, 12th December 2018 12:21:56 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-line-length
// tslint:disable:ter-indent

import { ParseQuery, XyoSerializationService } from '@xyo-network/serialization'

const fetterSetA = Buffer.from([
  0x30,
  0x16,
    0x12,
      0x20,
      0x15,
        0x0F,
          0x20,
          0x19,
            0x08,
              0x00,
              0x0E,
                0x05,
                  0xAA,
                  0xBB,
                  0xCC,
                  0xDD,
          0x00,
          0x13,
            0x02,
              0x01
])

const witnessSetB = Buffer.from([
  0x30, // typed iterable
  0x18, // witness set
    0x19, // 22 size
      0x20, // untyped iterable
      0x17, // witness
        0x16, // 22 size
          0x20,
          0x1A,
            0x08,
              0x00, // leaf
              0x0B, // stub sig
                0x05, // 5 size
                  0x44, // sig
                  0x33,
                  0x22,
                  0x11,
          0x00,
          0x14,
            0x09,
              0x00,
              0x00,
              0x01,
              0x67,
              0x7a,
              0xbd,
              0x29,
              0x38
])

describe(`BoundWitness Deserialization`, () => {

  it(`Should parse a stub public key`, () => {
    const src = Buffer.from([
      0x00,
      0x0E,
        0x05,
          0xAA,
          0xBB,
          0xCC,
          0xDD,
    ])
    const serializationService = new XyoSerializationService({})
    const result = serializationService.parse(src)
    expect(result.headerBytes).toEqual(src.slice(0, 3))
    expect(result.dataBytes).toEqual(src.slice(3))
    const query = new ParseQuery(result)
    expect(query.readData()).toEqual(src.slice(3))
    expect(query.readData(true)).toEqual(src)
  })

  it(`Should parse a typed keyset`, () => {
    const src = Buffer.from([
      0x30,
      0x0F,
        0x08,
          0x00,
          0x0E,
            0x05,
              0xAA,
              0xBB,
              0xCC,
              0xDD,
    ])

    const serializationService = new XyoSerializationService({})
    const result = serializationService.parse(src)
    expect(result.headerBytes).toEqual(src.slice(0, 3))
    expect(result.dataBytes).toEqual(src.slice(3))
    const query = new ParseQuery(result)
    expect(query.readData()).toEqual(src.slice(3))
    expect(query.readData(true)).toEqual(src)

    expect(query.query([0]).readData()).toEqual(src.slice(6))
    expect(query.query([0]).readData(true)).toEqual((src.slice(3)))
  })

  it(`Should parse a typed keyset with two items`, () => {
    const src = Buffer.from([
      0x30,
      0x0F,
        0x0D,
          0x00,
          0x0E,
            0x05,
              0xAA,
              0xBB,
              0xCC,
              0xDD,
            0x05,
              0xDD,
              0xCC,
              0xBB,
              0xAA,
    ])
    const serializationService = new XyoSerializationService({})
    const result = serializationService.parse(src)
    expect(result.headerBytes).toEqual(src.slice(0, 3))
    expect(result.dataBytes).toEqual(src.slice(3))
    const query = new ParseQuery(result)
    expect(query.readData()).toEqual(src.slice(3))
    expect(query.readData(true)).toEqual(src)

    expect(query.query([0]).readData()).toEqual(src.slice(6, 10))
    expect(query.query([0]).readData(true)).toEqual((src.slice(3, 10)))

    expect(query.query([1]).readData()).toEqual(src.slice(11))
    expect(query.query([1]).readData(true)).toEqual(
      Buffer.concat([
        Buffer.from([0x00, 0x0E]),
        src.slice(10)
      ]),
    )
  })

  it(`Should parse an untyped keyset`, () => {
    const src = Buffer.from([
      0x20,
      0x0F,
        0x08,
          0x00,
          0x0E,
            0x05,
              0xAA,
              0xBB,
              0xCC,
              0xDD,
    ])

    const serializationService = new XyoSerializationService({})
    const result = serializationService.parse(src)
    expect(result.headerBytes).toEqual(src.slice(0, 3))
    expect(result.dataBytes).toEqual(src.slice(3))
    const query = new ParseQuery(result)
    expect(query.readData()).toEqual(src.slice(3))
    expect(query.readData(true)).toEqual(src)

    expect(query.query([0]).readData()).toEqual(src.slice(6))
    expect(query.query([0]).readData(true)).toEqual((src.slice(3)))
  })

  it(`Should parse a typed keyset with two items`, () => {
    const src = Buffer.from([
      0x20,
      0x0F,
        0x0F,
          0x00,
          0x0E,
            0x05,
              0xAA,
              0xBB,
              0xCC,
              0xDD,
          0x00,
          0x0E,
            0x05,
              0xDD,
              0xCC,
              0xBB,
              0xAA
    ])

    const serializationService = new XyoSerializationService({})
    const result = serializationService.parse(src)
    expect(result.headerBytes).toEqual(src.slice(0, 3))
    expect(result.dataBytes).toEqual(src.slice(3))
    const query = new ParseQuery(result)
    expect(query.readData()).toEqual(src.slice(3))
    expect(query.readData(true)).toEqual(src)

    expect(query.query([0]).readData()).toEqual(src.slice(6, 10))
    expect(query.query([0]).readData(true)).toEqual((src.slice(3, 10)))

    expect(query.query([1]).readData()).toEqual(src.slice(13))
    expect(query.query([1]).readData(true)).toEqual(src.slice(10))
  })

  it(`Should parse a fetter`, () => {
    const src = Buffer.from([
      0x20,
      0x15,
        0x0F,
          0x20,
          0x19,
            0x08,
              0x00,
              0x0E,
                0x05,
                  0xAA,
                  0xBB,
                  0xCC,
                  0xDD,
          0x00,
          0x13,
            0x02,
              0x01
    ])
    const serializationService = new XyoSerializationService({})
    const result = serializationService.parse(src)
    const pQuery = new ParseQuery(result)

    expect(pQuery.query([0, 0]).readData()).toEqual(
      Buffer.from([
        0xAA,
        0xBB,
        0xCC,
        0xDD
      ])
    )

    expect(pQuery.query([1]).readData()).toEqual(Buffer.from([0x01]))
  })
})
