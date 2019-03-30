/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:52:23 pm
 * @Email:  developer@xyfindables.com
 * @Filename: parse-query.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IParseResult, IXyoSerializableObject } from "../@types"
import { XyoError, XyoErrors } from "@xyo-network/errors"

export class ParseQuery {

  constructor(private readonly parseResult: IParseResult) {

  }

  public query(queryIndexes: number[]) {
    const queriedParseResult = queryIndexes.reduce((parseResult, indexToQuery, indexInArray) => {
      if (Array.isArray(parseResult.data)) {
        const childParseResults = parseResult.data as IParseResult[]
        if (childParseResults.length > indexToQuery) {
          return childParseResults[indexToQuery]
        }
        throw new XyoError(`Data can not be queried. Index out of bounds ${indexInArray}`)
      }

      throw new XyoError(`Data can not be queried at index ${indexInArray}`)
    }, this.parseResult)

    return new ParseQuery(queriedParseResult)
  }

  public mapChildren<T>(callbackfn: (value: ParseQuery, index?: number) => T) {
    if (this.isReadable()) {
      throw new XyoError(`No children to map`)
    }

    return (this.parseResult.data as IParseResult[]).map((item, index) => {
      return callbackfn(new ParseQuery(item), index)
    })
  }

  public getChildAt(index: number): ParseQuery {
    if (this.isReadable()) {
      throw new XyoError(`No children to map`)
    }

    if (index > (this.parseResult.data as IParseResult[]).length) {
      throw new XyoError(`Index out of range`)
    }

    return new ParseQuery((this.parseResult.data as IParseResult[])[index])
  }

  public reduceChildren<T>(reducer: (aggregator: T, item: IParseResult, index: number) => T, startingValue: T) {
    if (this.isReadable()) {
      throw new XyoError(`No children to map`)
    }

    return (this.parseResult.data as IParseResult[]).reduce(reducer, startingValue)
  }

  public getChildrenCount(): number {
    if (this.parseResult.data instanceof Buffer) {
      return -1
    }

    return this.parseResult.data.length
  }

  public readData(withHeader: boolean = false): Buffer {
    if (!withHeader) {
      return this.parseResult.dataBytes
    }

    return Buffer.concat([
      this.parseResult.headerBytes,
      this.parseResult.dataBytes,
    ])
  }

  public isReadable(): boolean {
    return this.parseResult.data instanceof Buffer
  }
}
