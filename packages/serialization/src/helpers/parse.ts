import { readHeader } from "./readHeader"
import { sliceItem } from "./sliceItem"
import { IParseResult } from "../@types"

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:51:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: parse.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 3:16:12 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export function parse(src: Buffer): IParseResult {
  const partialSchema = readHeader(src)
  const data = sliceItem(src, 0, partialSchema, true)

  if (partialSchema.iterableType === 'not-iterable') {
    return {
      data,
      id: partialSchema.id,
      sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
      iterableType: 'not-iterable',
      bytes: data
    }
  }

  if (data.length === 0) {
    return {
      data: [],
      id: partialSchema.id,
      sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
      iterableType: 'not-iterable',
      bytes: data
    }
  }

  const items: IParseResult[] = []
  let innerHeader = readHeader(data)
  let innerHeaderBytes = data.slice(0, 2)
  let offset = 2
  let sizeBytes = data.slice(offset, offset + innerHeader.sizeIdentifierSize!)

  while (offset < data.length) {
    // tslint:disable-next-line:prefer-conditional-expression
    if (partialSchema.iterableType === 'iterable-untyped') {
      if (offset !== 2) {
        innerHeaderBytes = data.slice(offset, offset + 2)
        innerHeader = readHeader(innerHeaderBytes)
        offset += 2
      }
    }

    if (offset !== 2) {
      sizeBytes = data.slice(offset, offset + innerHeader.sizeIdentifierSize!)
    }

    const bytes = sliceItem(data, offset, innerHeader, false)

    offset += bytes.length + innerHeader.sizeIdentifierSize!
    if (innerHeader.iterableType !== 'not-iterable') {
      items.push(parse(Buffer.concat([innerHeaderBytes, sizeBytes, bytes])))
    } else {
      items.push({
        id: innerHeader.id,
        sizeIdentifierSize: innerHeader.sizeIdentifierSize!,
        iterableType: innerHeader.iterableType!,
        data: bytes,
        bytes: data
      })
    }

  }

  return {
    data: items,
    id: partialSchema.id,
    sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
    iterableType: partialSchema.iterableType!,
    bytes: data
  }
}
