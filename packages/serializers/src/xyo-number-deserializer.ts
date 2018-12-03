/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 11:09:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-index-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 9:44:14 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDeserializer, IXyoSerializableObject, IXyoSerializationService, parse, ParseQuery } from "@xyo-network/serialization"
import { signedNumberToBuffer, unsignedNumberToBuffer, readNumberFromBuffer } from "@xyo-network/buffer-utils"

export class XyoSerializableNumber implements IXyoSerializableObject {

  constructor (
    public readonly number: number,
    public readonly isSigned: boolean,
    public readonly schemaObjectId: number
  ) {}

  public get val (): number {
    return this.number
  }

  public serialize() {
    if (this.isSigned) {
      return signedNumberToBuffer(this.number)
    }

    return unsignedNumberToBuffer(this.number)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoNumberDeserializer implements IXyoDeserializer<XyoSerializableNumber> {

  constructor (
    public readonly isSigned: boolean,
    public readonly schemaObjectId: number
  ) {}

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoSerializableNumber {
    const parseResult = parse(data)
    const q = new ParseQuery(parseResult)
    const buf = q.readData()
    const num = readNumberFromBuffer(buf, buf.length, this.isSigned)
    return new XyoSerializableNumber(num, this.isSigned, this.schemaObjectId)
  }
}
