/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 4:48:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-nested-bound-witness-extractor-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th December 2018 10:28:43 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness } from '@xyo-network/bound-witness'

/**
 *  This class is useful for extracting out bridged blocks nested inside of bound-witnesses
 *
 * @export
 * @class XyoNestedBoundWitnessExtractor
 */
export class XyoNestedBoundWitnessExtractor {
  constructor(private readonly isBridgeBlockSetFn: (obj: any) => boolean) {}

  /**
   * Bound witnesses can contain other bound-witnesses within their unsigned payload.
   * This is the fundamental way to bridge blocks in the Xyo protocol. This nesting
   * isn't necessarily one layer deep, it can be n-deep.
   *
   * This is a helper for recursively extracting the nested bound witnesses and flattening
   * them out.
   */

  public extractNestedBoundWitnesses(boundWitness: IXyoBoundWitness) {
    const nestedBoundWitnesses: IXyoBoundWitness[] = []
    this.recursivelyExtractNestedBoundWitnesses(boundWitness, nestedBoundWitnesses)
    return nestedBoundWitnesses
  }

  /**
   * Often bound-witness pass around origin-chains in their unsigned payloads so they can bridged or
   * archived. This helper function recursively extracts out those origin chains so they can be processed.
   */

  private recursivelyExtractNestedBoundWitnesses(
    boundWitness: IXyoBoundWitness,
    boundWitnessContainer: IXyoBoundWitness[]
  ) {

    // TODO

    // boundWitness.payloads.forEach((payload) => {
    //   payload.unsignedPayload.forEach((unsignedPayloadItem) => {
    //     if (!this.isBridgeBlockSetFn(unsignedPayloadItem)) {
    //       return
    //     }

    //     const nestedBridgeBlockSet = fromArray<IXyoBoundWitness>(unsignedPayloadItem)
    //     nestedBridgeBlockSet.forEach((nestedBoundWitness) => {
    //       boundWitnessContainer.push(nestedBoundWitness)
    //       this.recursivelyExtractNestedBoundWitnesses(nestedBoundWitness, boundWitnessContainer)
    //     })
    //   })
    // })
  }
}
