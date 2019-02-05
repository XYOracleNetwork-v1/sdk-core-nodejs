/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 5th February 2019 1:45:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th February 2019 2:38:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoComponentFeatureResponse } from "../@types"
import { XyoFetterSet, XyoWitnessSet } from "@xyo-network/bound-witness"

function tryParse<T>(message: Buffer, context: any): T| undefined {
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
    context.logger.error(`There was an error parsing message buffer ${message} from public key ${context.publicKey}`, e)
    return undefined
  }
}

export function tryParseComponentFeature(message: Buffer, context: any): IXyoComponentFeatureResponse | undefined {
  return tryParse<IXyoComponentFeatureResponse>(message, context)
}

export function tryParseFetterSet(message: Buffer, context: any): XyoFetterSet | undefined {
  return tryParse<XyoFetterSet>(message, context)
}

export function tryParseWitnessSet(message: Buffer, context: any): XyoWitnessSet | undefined {
  return tryParse<XyoWitnessSet>(message, context)
}
