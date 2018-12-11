/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 6th December 2018 5:36:11 pm
 * @Email:  developer@xyfindables.com
 * @Filename: tree-iterator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 6th December 2018 6:04:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseSerializable } from './base-serializable'
import { IXyoSerializableObject, IParseResult } from '../@types'
import { ParseQuery } from './parse-query'

export class XyoTreeIterator extends XyoBaseSerializable implements IXyoSerializableObject {

  constructor (private readonly parseResult: IParseResult) {
    super()
  }

  get schemaObjectId (): number {
    return this.parseResult.id
  }

  public getData(): Buffer {
    return this.parseResult.dataBytes
  }

  public query() {
    return new ParseQuery(this.parseResult)
  }

  public hydrate<T extends IXyoSerializableObject>(): T {
    return XyoBaseSerializable.serializationService.hydrate<T>(this.parseResult) as T
  }
}
