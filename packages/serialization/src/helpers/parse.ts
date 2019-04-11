/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:51:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: parse.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:23:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { readHeader } from "./readHeader"
import { sliceItem } from "./sliceItem"
import { IParseResult, IXyoObjectSchema } from "../@types"
import { XyoOnTheFlySerializable } from "./on-the-fly-serializable"

export function parse(src: Buffer, schema: IXyoObjectSchema): IParseResult {
  const partialSchema = readHeader(src)
  const data = sliceItem(src, 0, partialSchema, true)
  const headerBytes = src.slice(0, 2 + partialSchema.sizeIdentifierSize!)

  if (partialSchema.iterableType === 'not-iterable') {
    return {
      data,
      headerBytes,
      id: partialSchema.id,
      sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
      dataBytes: data,
      iterableType: 'not-iterable'
    }
  }

  if (data.length === 0) {
    return {
      headerBytes,
      data: [],
      id: partialSchema.id,
      sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
      iterableType: 'not-iterable',
      dataBytes: data
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
      items.push(parse(Buffer.concat([innerHeaderBytes, sizeBytes, bytes]), schema))
    } else {
      items.push({
        id: innerHeader.id,
        sizeIdentifierSize: innerHeader.sizeIdentifierSize!,
        iterableType: innerHeader.iterableType!,
        data: bytes,
        dataBytes: bytes,
        headerBytes: Buffer.concat([innerHeaderBytes, sizeBytes])
      })
    }

  }

  return {
    headerBytes,
    data: items,
    id: partialSchema.id,
    sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
    iterableType: partialSchema.iterableType!,
    dataBytes: data
  }
}
