/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:51:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 3:25:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { BufferOrString, IXyoSerializationService } from "./@types"

import { XyoBase } from '@xyo-network/base'

export class XyoSerializationService extends XyoBase implements IXyoSerializationService {

  public serialize(serializable: any, serializationType?: "buffer" | "hex" | undefined): BufferOrString {
    throw new Error("Method not implemented.")
  }

  public deserialize<T>(deserializable: BufferOrString): T {
    throw new Error("Method not implemented.")
  }
}
