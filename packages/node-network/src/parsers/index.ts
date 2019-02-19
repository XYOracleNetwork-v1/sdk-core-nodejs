/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 5th February 2019 1:45:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 7th February 2019 10:57:19 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoComponentFeatureResponse } from "../@types"
import { XyoFetterSet, XyoWitnessSet, IXyoBoundWitnessFragment } from "@xyo-network/bound-witness"
import { IXyoHash } from "@xyo-network/hashing"
import { XyoBase } from "@xyo-network/base"
import { IXyoSerializationService, IXyoSerializableObject } from "@xyo-network/serialization"

export class XyoMessageParser extends XyoBase {

  constructor(private readonly serializationService: IXyoSerializationService) {
    super()
  }

  public tryParseComponentFeature(message: Buffer, context: IParseContext): IXyoComponentFeatureResponse | undefined {
    return this.tryParseJSON<IXyoComponentFeatureResponse>(message, context)
  }

  public tryParseFetterSet(message: Buffer, context: IParseContext): XyoFetterSet | undefined {
    return this.tryParseSerializableObject<XyoFetterSet>(message, context)
  }

  public tryParseWitnessSet(message: Buffer, context: IParseContext): XyoWitnessSet | undefined {
    return this.tryParseSerializableObject<XyoWitnessSet>(message, context)
  }

  public  tryParseHash(message: Buffer, context: IParseContext): IXyoHash | undefined {
    return this.tryParseSerializableObject<IXyoHash>(message, context)
  }

  public tryParseBoundWitnessFragment(message: Buffer, context: IParseContext): IXyoBoundWitnessFragment | undefined {
    return this.tryParseSerializableObject<IXyoBoundWitnessFragment>(message, context)
  }

  private tryParseJSON<T>(message: Buffer, context: any): T| undefined {
    if (!message || message.length === 0) {
      context.logger.error(`No message provided, can not parse from public key ${context.publicKey}`)
      return undefined
    }

    try {
      const res = JSON.parse(message.toString())
      if (context.validation) {
        context.validation(res)
      }

      return res as T
    } catch (e) {
      this.logError(`There was an error parsing message buffer ${message} from public key ${context.publicKey}`, e)
      return undefined
    }
  }

  private tryParseSerializableObject<T extends IXyoSerializableObject>(message: Buffer, context: any): T| undefined {
    if (!message || message.length === 0) {
      context.logger.error(`No message provided, can not parse from public key ${context.publicKey}`)
      return undefined
    }

    try {
      const res = this.serializationService.deserialize(message).hydrate<T>()
      if (context.validation) {
        context.validation(res)
      }

      return res as T
    } catch (e) {
      this.logError(`There was an error parsing message buffer ${message} from public key ${context.publicKey}`, e)
      return undefined
    }
  }
}

export interface IParseContext {
  publicKey: string
}
