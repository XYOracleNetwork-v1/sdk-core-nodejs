/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:52:23 pm
 * @Email:  developer@xyfindables.com
 * @Filename: parse-query.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:52:56 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IParseResult } from "../@types"
import { XyoError, XyoErrors } from "@xyo-network/errors"
import { serialize } from "./serialize"

export class ParseQuery {
  constructor(private readonly parseResult: IParseResult) {}

  public query(queryIndexes: number[]) {
    const queriedParseResult = queryIndexes.reduce((parseResult, indexToQuery, indexInArray) => {
      if (Array.isArray(parseResult.data)) {
        const childParseResults = parseResult.data as IParseResult[]
        if (childParseResults.length > indexToQuery) {
          return childParseResults[indexToQuery]
        }
        throw new XyoError(`Data can not be queried. Index out of bounds ${indexInArray}`, XyoErrors.CRITICAL)
      }

      throw new XyoError(`Data can not be queried at index ${indexInArray}`, XyoErrors.CRITICAL)
    }, this.parseResult)

    return new ParseQuery(queriedParseResult)
  }

  public mapChildren<T>(callbackfn: (value: ParseQuery, index?: number) => T) {
    if (this.isReadable()) {
      throw new XyoError(`No children to map`, XyoErrors.CRITICAL)
    }

    return (this.parseResult.data as IParseResult[]).map((item, index) => {
      return callbackfn(new ParseQuery(item), index)
    })
  }

  public readData(withHeader: boolean = false): Buffer {
    if (!(this.parseResult.data instanceof Buffer)) {
      throw new XyoError(`Data is not readable`, XyoErrors.CRITICAL)
    }

    if (!withHeader) {
      return this.parseResult.data
    }

    return serialize(this.parseResult.data, {
      sizeIdentifierSize: this.parseResult.sizeIdentifierSize,
      id: this.parseResult.id,
      iterableType: this.parseResult.iterableType
    })
  }

  public isReadable(): boolean {
    return this.parseResult.data instanceof Buffer
  }
}
