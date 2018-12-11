/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 7th December 2018 11:59:00 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 4:02:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable, IXyoDeserializer, parse, ParseQuery } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
import { unsignedIntegerToBuffer, readIntegerFromBuffer } from '@xyo-network/buffer-utils'

export class XyoIndex extends XyoBaseSerializable {

  public static deserializer: IXyoDeserializer<XyoIndex>

  public readonly schemaObjectId = schema.index.id

  constructor (public readonly number: number) {
    super()
  }

  public getData(): Buffer {
    return unsignedIntegerToBuffer(this.number)
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoIndexDeserializer implements IXyoDeserializer<XyoIndex> {
  public readonly schemaObjectId = schema.index.id

  public deserialize(data: Buffer): XyoIndex {
    const parseResult = parse(data)
    const parseQuery = new ParseQuery(parseResult)
    const numberBuffer = parseQuery.readData(false)
    return new XyoIndex(readIntegerFromBuffer(numberBuffer, numberBuffer.length, false, 0))
  }
}

XyoIndex.deserializer = new XyoIndexDeserializer()
