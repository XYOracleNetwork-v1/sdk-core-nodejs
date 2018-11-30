import { IXyoDeserializer, IXyoSerializableObject, parse, ParseQuery } from "@xyo-network/serialization"

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 11:43:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-blob-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 11:52:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export class XyoSerializableBlob implements IXyoSerializableObject {

  constructor (public readonly schemaObjectId: number, public readonly toBlob: () => Buffer) {}

  public serialize(): Buffer {
    return this.toBlob()
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoBlobDeserializer<T extends IXyoSerializableObject> implements IXyoDeserializer<T> {

  constructor (
    public readonly schemaObjectId: number,
    public readonly fromBlob: (blob: Buffer) => T
  ) {}

  public deserialize(data: Buffer): T {
    const parseResult = parse(data)
    const q = new ParseQuery(parseResult)
    const buf = q.readData()

    return this.fromBlob(buf)
  }

}
