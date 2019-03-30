/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 4:48:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-nested-bound-witness-extractor-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st December 2018 2:46:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBridgeBlockSet } from '@xyo-network/origin-chain'
/**
 *  This class is useful for extracting out bridged blocks nested inside of bound-witnesses
 *
 * @export
 * @class XyoNestedBoundWitnessExtractor
 */
export class XyoNestedBoundWitnessExtractor {

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

    boundWitness.metadata.forEach((payload) => {
      payload.forEach((unsignedPayloadItem) => {
        if (unsignedPayloadItem.schemaObjectId !== schema.bridgeBlockSet.id) {
          return
        }

        const nestedBridgeBlockSet = unsignedPayloadItem as XyoBridgeBlockSet
        nestedBridgeBlockSet.boundWitnesses.forEach((nestedBoundWitness) => {
          boundWitnessContainer.push(nestedBoundWitness)
          this.recursivelyExtractNestedBoundWitnesses(nestedBoundWitness, boundWitnessContainer)
        })
      })
    })
  }
}
