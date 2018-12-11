/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:51:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: parse.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:51:32 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { readHeader } from "./readHeader"
import { sliceItem } from "./sliceItem"
import { IParseResult } from "../@types"
import { XyoOnTheFlySerializable } from "./on-the-fly-serializable"

export function parse(src: Buffer): IParseResult {
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
      iterableType: 'not-iterable',
      toSerializable: () => {
        return new XyoOnTheFlySerializable(partialSchema.id, {
          buffer: data
        })
      }
    }
  }

  if (data.length === 0) {
    return {
      headerBytes,
      data: [],
      id: partialSchema.id,
      sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
      iterableType: 'not-iterable',
      dataBytes: data,
      toSerializable: () => {
        return new XyoOnTheFlySerializable(partialSchema.id, {
          buffer: data
        })
      }
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
        dataBytes: bytes,
        headerBytes: Buffer.concat([innerHeaderBytes, sizeBytes]),
        toSerializable: () => {
          return new XyoOnTheFlySerializable(innerHeader.id, {
            buffer: bytes
          })
        }
      })
    }

  }

  return {
    headerBytes,
    data: items,
    id: partialSchema.id,
    sizeIdentifierSize: partialSchema.sizeIdentifierSize!,
    iterableType: partialSchema.iterableType!,
    dataBytes: data,
    toSerializable: () => {
      return new XyoOnTheFlySerializable(partialSchema.id, {
        buffer: data
      })
    }
  }
}
