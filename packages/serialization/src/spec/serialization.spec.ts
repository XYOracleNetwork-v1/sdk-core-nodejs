/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 1:26:31 pm
 * @Email:  developer@xyfindables.com
 * @Filename: serialization.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:58:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { resolveSerializablesToBuffer } from '../helpers/resolveSerializablesToBuffer'
import { IXyoSerializableObject, IXyoObjectSchema } from '../@types'
import { XyoBaseSerializable } from '../helpers/base-serializable'
import { findSchemaById } from '../helpers/findSchemaById'

describe(`Serialization`, () => {

  it(`Should serialize typed simple collection`, () => {
    const schema: IXyoObjectSchema = {
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
    }
    const xCollection = new XCollection(schema, [new X(schema, 1)])
    const result = resolveSerializablesToBuffer(findSchemaById(2, schema), schema, xCollection.getData())

    expect(Buffer.from([
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01 // value of first element
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize typed simple collection using high watermark for size encoding`, () => {
    const schema: IXyoObjectSchema = {
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
    }
    const xCollection = new XCollection(schema, [new X(schema, 1), new X(schema, 256), new X(schema, 65536)])
    const result = resolveSerializablesToBuffer(findSchemaById(2, schema), schema, xCollection.getData())

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
    const schema: IXyoObjectSchema = {
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
    }
    const xCollection = new XCollection(schema, [new X(schema, 1)])
    const result = resolveSerializablesToBuffer(findSchemaById(2, schema), schema, xCollection.getData())

    expect(Buffer.from([
      0x00, // size bits with reserved bits
      0x01, // x-id
      0x02, // size of first element
      0x01 // value of first element
    ]).equals(result)).toBe(true)
  })

  it(`Should serialize typed simple collection with 2 objects`, () => {
    const schema: IXyoObjectSchema = {
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
    }
    const xCollection = new XCollection(schema, [new X(schema, 1), new X(schema, 2)])
    const result = resolveSerializablesToBuffer(findSchemaById(2, schema), schema, xCollection.getData())

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
    const schema: IXyoObjectSchema = {
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
    }
    const xCollection = new XCollection(schema, [new X(schema, 1), new X(schema, 2)])
    const result = resolveSerializablesToBuffer(findSchemaById(2, schema), schema, xCollection.getData())

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
    const schema: IXyoObjectSchema = {
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
    }
    const xCollectionSet = new XCollectionSet(schema, [])
    const result = resolveSerializablesToBuffer(findSchemaById(3, schema), schema, xCollectionSet.getData())

    expect(Buffer.from([]).equals(result)).toBe(true)
  })

  it(`Should serialize a collection of untyped collections 2 objects`, () => {
    const schema: IXyoObjectSchema = {
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
    }
    const xCollection = new XCollection(schema, [new X(schema, 1), new X(schema, 2)])
    const xCollectionSet = new XCollectionSet(schema, [xCollection])
    const result = resolveSerializablesToBuffer(findSchemaById(3, schema), schema, xCollectionSet.getData())

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
    const schema: IXyoObjectSchema = {
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
    }
    const xCollection = new XCollection(schema, [new X(schema, 1), new X(schema, 2)])
    const xCollectionSet = new XCollectionSet(schema, [xCollection])
    const result = resolveSerializablesToBuffer(findSchemaById(3, schema), schema, xCollectionSet.getData())

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

  constructor(schema: IXyoObjectSchema, private readonly value: number) { super(schema) }

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

  public getReadableValue () {
    return this.value
  }
}

// tslint:disable-next-line:max-classes-per-file
class DynamicX extends XyoBaseSerializable implements IXyoSerializableObject {
  public readonly schemaObjectId: number = 1

  constructor(schema: IXyoObjectSchema, private readonly value: number) { super(schema) }

  public getData(): Buffer | IXyoSerializableObject[] {
    const b = Buffer.alloc(1)
    b.writeUInt8(this.value, 0)
    return b
  }

  public getReadableValue () {
    return this.value
  }
}

// tslint:disable-next-line:max-classes-per-file
class XCollection extends XyoBaseSerializable implements IXyoSerializableObject {
  public readonly schemaObjectId: number = 2

  constructor(schema: IXyoObjectSchema, private readonly collection: X[]) { super(schema) }

  public getData(): IXyoSerializableObject[] {
    return this.collection
  }

  public getReadableValue () {
    return this.collection.map(i => i.getReadableValue())
  }
}

// tslint:disable-next-line:max-classes-per-file
class XCollectionSet extends XyoBaseSerializable implements IXyoSerializableObject {
  public readonly schemaObjectId: number = 3

  constructor(schema: IXyoObjectSchema, private readonly collection: XCollection[]) { super(schema) }

  public getData(): IXyoSerializableObject[] {
    return this.collection
  }

  public getReadableValue () {
    return this.collection.map(i => i.getReadableValue())
  }
}
