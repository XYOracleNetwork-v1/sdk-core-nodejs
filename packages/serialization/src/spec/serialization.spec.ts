/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 1:26:31 pm
 * @Email:  developer@xyfindables.com
 * @Filename: serialization.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:03:54 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { resolveSerializablesToBuffer } from '../helpers/resolveSerializablesToBuffer'
import { IXyoSerializableObject } from '../@types'
import { XyoBaseSerializable } from '../helpers/base-serializable'

describe(`Serialization`, () => {

  it(`Should serialize typed simple collection`, () => {
    const xCollection = new XCollection([new X(1)])
    const result = resolveSerializablesToBuffer(2, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-typed'
      }
    }, xCollection.getData())

    expect(Buffer.from([
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01 // value of first element
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize typed simple collection using high watermark for size encoding`, () => {
    const xCollection = new XCollection([new X(1), new X(256), new X(65536)])
    const result = resolveSerializablesToBuffer(2, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-typed'
      }
    }, xCollection.getData())

    expect(Buffer.from([
      0x00, // size bits with reserved bits
      0x01, // x-id

      0x02, // size of first element
      0x01, // value of first element

      0x03, // size of second element
      0x01, // value of second element
      0x00,

      0x05, // size of third element
      0x00, // value of third element
      0x01,
      0x00,
      0x00
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize untyped simple collection`, () => {
    const xCollection = new XCollection([new X(1)])
    const result = resolveSerializablesToBuffer(2, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-untyped'
      }
    }, xCollection.getData())

    expect(Buffer.from([
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01 // value of first element
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize typed simple collection with 2 objects`, () => {
    const xCollection = new XCollection([new X(1), new X(2)])
    const result = resolveSerializablesToBuffer(2, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-typed'
      }
    }, xCollection.getData())

    expect(Buffer.from([
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01, // value of first element
      0x02, // size of second element
      0x02 // value of second element
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize untyped simple collection with 2 objects`, () => {
    const xCollection = new XCollection([new X(1), new X(2)])
    const result = resolveSerializablesToBuffer(2, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-untyped'
      }
    }, xCollection.getData())

    expect(Buffer.from([
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01, // value of first element
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of second element
      0x02 // value of second element
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize a collection of untyped collections with 0 objects`, () => {
    const xCollectionSet = new XCollectionSet([])
    const result = resolveSerializablesToBuffer(3, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-untyped'
      },
      xCollectionSet: {
        id: 3,
        sizeIdentifierSize: null,
        iterableType: 'iterable-typed'
      }
    }, xCollectionSet.getData())

    expect(Buffer.from([]).equals(result)).toBe(true)
  })

  it(`Should serialize a collection of untyped collections 2 objects`, () => {
    const xCollection = new XCollection([new X(1), new X(2)])
    const xCollectionSet = new XCollectionSet([xCollection])
    const result = resolveSerializablesToBuffer(3, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-untyped'
      },
      xCollectionSet: {
        id: 3,
        sizeIdentifierSize: null,
        iterableType: 'iterable-typed'
      }
    }, xCollectionSet.getData())

    expect(Buffer.from([
      0x20, // size bits with reserved bits
      0x02, // x-collection-id
      0x09, // size of first element
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01, // value of first element
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of second element
      0x02 // value of second element
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize a collection of typed collections 2 objects`, () => {
    const xCollection = new XCollection([new X(1), new X(2)])
    const xCollectionSet = new XCollectionSet([xCollection])
    const result = resolveSerializablesToBuffer(3, {
      x: {
        id: 1,
        sizeIdentifierSize: null,
        iterableType: 'not-iterable'
      },
      xCollection: {
        id: 2,
        sizeIdentifierSize: null,
        iterableType: 'iterable-typed'
      },
      xCollectionSet: {
        id: 3,
        sizeIdentifierSize: null,
        iterableType: 'iterable-untyped'
      }
    }, xCollectionSet.getData())

    expect(Buffer.from([
      0x30, // size bits with reserved bits
      0x02, // x-collection-id
      0x07, // size of first element
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01, // value of first element
      0x02, // size of second element
      0x02 // value of second element
    ]).equals(result)).toBe(true)
  })
})

class X extends XyoBaseSerializable implements IXyoSerializableObject {
  public readonly schemaObjectId: number = 1

  constructor(private readonly value: number) { super() }

  public getData(): Buffer {
    if (this.value <= 255) {
      const b = Buffer.alloc(1)
      b.writeUInt8(this.value, 0)
      return b
    }

    if (this.value <= 65535) {
      const b2 = Buffer.alloc(2)
      b2.writeUInt16BE(this.value, 0)
      return b2
    }

    const b3 = Buffer.alloc(4)
    b3.writeUInt32BE(this.value, 0)
    return b3
  }
}

// tslint:disable-next-line:max-classes-per-file
class DynamicX extends XyoBaseSerializable implements IXyoSerializableObject {
  public readonly schemaObjectId: number = 1

  constructor(private readonly value: number) { super() }

  public getData(): Buffer | IXyoSerializableObject[] {
    const b = Buffer.alloc(1)
    b.writeUInt8(this.value, 0)
    return b
  }
}

// tslint:disable-next-line:max-classes-per-file
class XCollection extends XyoBaseSerializable implements IXyoSerializableObject {
  public readonly schemaObjectId: number = 2

  constructor(private readonly collection: X[]) { super() }

  public getData(): IXyoSerializableObject[] {
    return this.collection
  }
}

// tslint:disable-next-line:max-classes-per-file
class XCollectionSet extends XyoBaseSerializable implements IXyoSerializableObject {
  public readonly schemaObjectId: number = 3

  constructor(private readonly collection: XCollection[]) { super() }

  public getData(): IXyoSerializableObject[] {
    return this.collection
  }
}
