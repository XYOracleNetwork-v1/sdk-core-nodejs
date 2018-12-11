/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 1:23:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:45:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, parse  } from '@xyo-network/serialization'
import { signedIntegerToBuffer, unsignedIntegerToBuffer, readIntegerFromBuffer, doubleToBuffer, floatToBuffer, readFloatFromBuffer, readDoubleFromBuffer } from '@xyo-network/buffer-utils'
import { XyoError, XyoErrors  } from '@xyo-network/errors'

type NumberType = 'unsigned-integer' | 'signed-integer' | 'float' | 'double'
export class XyoSerializableNumber extends XyoBaseSerializable  {

  constructor (
    public readonly number: number,
    public schemaObjectId: number,
    public readonly numberType: NumberType
  ) {
    super()
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

    throw new XyoError(`Unsupported number typed ${this.numberType || 'undefined'}`, XyoErrors.CRITICAL)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoNumberDeserializer implements IXyoDeserializer<XyoSerializableNumber> {

  constructor (
    public readonly schemaObjectId: number,
    public readonly numberType: NumberType
  ) {}

  public deserialize(data: Buffer): XyoSerializableNumber {
    const parseResult = parse(data)
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
      throw new XyoError(`Unsupported number typed ${this.numberType || 'undefined'}`, XyoErrors.CRITICAL)
    }

    return new XyoSerializableNumber(number, this.schemaObjectId, this.numberType)
  }
}

function getNumberSerializer(schemaObjectId: number, numberType: NumberType) {
  const deserializer = new XyoNumberDeserializer(schemaObjectId, numberType)
  return {
    deserializer,
    newInstance: (number: number) => {
      return new XyoSerializableNumber(number, schemaObjectId, numberType)
    }
  }
}

export function getUnsignedIntegerSerializer(schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'unsigned-integer')
}

export function getSignedIntegerSerializer(schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'signed-integer')
}

export function getFloatSerializer(schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'float')
}

export function getDoubleSerializer(schemaObjectId: number) {
  return getNumberSerializer(schemaObjectId, 'double')
}
