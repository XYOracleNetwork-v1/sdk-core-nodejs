/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 5:13:27 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 30th November 2018 1:00:31 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export { XyoBoundWitnessDeserializer } from './xyo-bound-witness-deserializer'
export { XyoNumberDeserializer, XyoSerializableNumber } from './xyo-number-deserializer'
export { XyoBlobDeserializer, XyoSerializableBlob } from './xyo-blob-deserializer'
export { XyoHashDeserializer } from './xyo-hash-deserializer'

import { IXyoSerializableObject, IXyoDeserializer, parse, ParseQuery, IParseResult } from '@xyo-network/serialization'

export class XyoAnonymousSerializableObject implements IXyoSerializableObject {

  constructor (private readonly parseResult: IParseResult) {}

  get schemaObjectId (): number {
    return this.parseResult.id
  }

  public serialize(): Buffer {
    return this.parseResult.bytes
  }

  public query() {
    return new ParseQuery(this.parseResult)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class XyoNotYetImplementedSerializer implements IXyoDeserializer<XyoAnonymousSerializableObject> {

  constructor (public readonly schemaObjectId: number) {

  }

  public deserialize(data: Buffer): XyoAnonymousSerializableObject {
    const parseResult = parse(data)
    return new XyoAnonymousSerializableObject(parseResult)
  }
}
