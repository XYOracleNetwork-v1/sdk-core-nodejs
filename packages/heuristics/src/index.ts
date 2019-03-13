/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 1:23:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, IXyoObjectSchema  } from '@xyo-network/serialization'
import { signedIntegerToBuffer, unsignedIntegerToBuffer, readIntegerFromBuffer, doubleToBuffer, floatToBuffer, readFloatFromBuffer, readDoubleFromBuffer } from '@xyo-network/buffer-utils'
import { XyoError, XyoErrors  } from '@xyo-network/errors'

type NumberType = 'unsigned-integer' | 'signed-integer' | 'float' | 'double'
export class XyoSerializableNumber extends XyoBaseSerializable  {

  constructor (
    public readonly number: number,
    schema: IXyoObjectSchema,
    public schemaObjectId: number,
    public readonly numberType: NumberType
  ) {
    super(schema)
  }

  public getData(): Buffer {
    if (this.numberType === 'unsigned-integer') {
      return unsignedIntegerToBuffer(this.number)
    }

    if (this.numberType === 'signed-integer') {
      return signedIntegerToBuffer(this.number)
    }

    if (this.numberType === 'float') {
      return floatToBuffer(this.number)
    }

    if (this.numberType === 'double') {
      return doubleToBuffer(this.number)
    }

    throw new XyoError(`Unsupported number typed ${this.numberType || 'undefined'}`)
  }

  public getReadableValue() {
    return this.number
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoNumberDeserializer implements IXyoDeserializer<XyoSerializableNumber> {

  constructor (
    public readonly schemaObjectId: number,
    public readonly numberType: NumberType
  ) {}

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoSerializableNumber {
    const parseResult = serializationService.parse(data)
    let number: number

    if (this.numberType === 'unsigned-integer') {
      number = readIntegerFromBuffer(parseResult.dataBytes, parseResult.dataBytes.length, false, 0)
    } else if (this.numberType === 'signed-integer') {
      number = readIntegerFromBuffer(parseResult.dataBytes, parseResult.dataBytes.length, true, 0)
    } else if (this.numberType === 'float') {
      number = readFloatFromBuffer(parseResult.dataBytes, 0)
    } else if (this.numberType === 'double') {
      number = readDoubleFromBuffer(parseResult.dataBytes, 0)
    } else {
      throw new XyoError(`Unsupported number typed ${this.numberType || 'undefined'}`)
    }

    return new XyoSerializableNumber(number, serializationService.schema, this.schemaObjectId, this.numberType)
  }
}

function getNumberSerializer(schemaObjectId: number, numberType: NumberType, schema: IXyoObjectSchema) {
  const deserializer = new XyoNumberDeserializer(schemaObjectId, numberType)
  return {
    deserializer,
    newInstance: (number: number) => {
      return new XyoSerializableNumber(number, schema, schemaObjectId, numberType)
    }
  }
}

export function getUnsignedIntegerSerializer(schema: IXyoObjectSchema, schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'unsigned-integer', schema)
}

export function getSignedIntegerSerializer(schema: IXyoObjectSchema, schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'signed-integer', schema)
}

export function getFloatSerializer(schema: IXyoObjectSchema, schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'float', schema)
}

export function getDoubleSerializer(schema: IXyoObjectSchema, schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'double', schema)
}
