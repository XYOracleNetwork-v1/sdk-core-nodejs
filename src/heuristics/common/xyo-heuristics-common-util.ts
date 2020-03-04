/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  XyoHumanHeuristicResolver,
  IXyoHumanHeuristic
} from '../xyo-heuristic-resolver'
import { XyoIterableStructure } from '../../object-model'

export const readSignedNumber = (buffer: Buffer): number => {
  switch (buffer.length) {
    case 1:
      return buffer.readInt8(0)
    case 2:
      return buffer.readInt16BE(0)
    case 4:
      return buffer.readInt32BE(0)
  }

  return -1
}

export const readUnsignedNumber = (buffer: Buffer): number => {
  switch (buffer.length) {
    case 1:
      return buffer.readUInt8(0)
    case 2:
      return buffer.readUInt16BE(0)
    case 4:
      return buffer.readUInt32BE(0)
  }

  return -1
}

export const uniqueIterableToObject = (
  buffer: XyoIterableStructure
): { [key: string]: any } => {
  const it = buffer.newIterator()
  const map: { [key: string]: any } = {}

  while (it.hasNext()) {
    const child = it.next().value
    const readable = XyoHumanHeuristicResolver.resolve(
      child.getAll().getContentsCopy()
    )
    map[readable.name] = readable.value
  }

  return map
}

export const iterableObjectToArray = (
  buffer: XyoIterableStructure
): IXyoHumanHeuristic[] => {
  const it = buffer.newIterator()
  const arr: IXyoHumanHeuristic[] = []

  while (it.hasNext()) {
    const child = it.next().value
    const readable = XyoHumanHeuristicResolver.resolve(
      child.getAll().getContentsCopy()
    )
    arr.push(readable)
  }

  return arr
}
