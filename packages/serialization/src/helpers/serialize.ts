/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 4:56:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: serialize.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 5:17:05 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectPartialSchema } from "../@types"
import { getHeader } from "./getHeader"

/**
 * Serializes an arbitrary buffer in accordance with the XYO packing protocol
 *
 * @export
 * @param {Buffer} bytes The bytes to serialize
 * @param {IXyoObjectPartialSchema} scheme The schema used to serialize it with
 * @returns {Buffer} Returns the serialized Buffer
 */
export function serialize(bytes: Buffer, scheme: IXyoObjectPartialSchema): Buffer {
  return Buffer.concat([
    getHeader(bytes.length, scheme),
    bytes
  ])
}
