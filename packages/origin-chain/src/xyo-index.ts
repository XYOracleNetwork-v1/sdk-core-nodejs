/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 11:59:00 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:56:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, ParseQuery, IXyoSerializationService } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { unsignedIntegerToBuffer, readIntegerFromBuffer } from '@xyo-network/buffer-utils'

export class XyoIndex extends XyoBaseSerializable {

  public static deserializer: IXyoDeserializer<XyoIndex>

  public readonly schemaObjectId = schema.index.id

  constructor (public readonly number: number, private rIndex?: Buffer) {
    super(schema)
  }

  public getData(): Buffer {
    if (this.rIndex) {
      return this.rIndex
    }

    return unsignedIntegerToBuffer(this.number)
  }

  public getReadableValue () {
    return this.number
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoIndexDeserializer implements IXyoDeserializer<XyoIndex> {
  public readonly schemaObjectId = schema.index.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoIndex {
    const parseResult = serializationService.parse(data)
    const parseQuery = new ParseQuery(parseResult)
    const numberBuffer = parseQuery.readData(false)
    return new XyoIndex(readIntegerFromBuffer(numberBuffer, numberBuffer.length, false, 0), numberBuffer)
  }
}

XyoIndex.deserializer = new XyoIndexDeserializer()
