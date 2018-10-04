/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:00:03 am
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness-origin-chain-extractor.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:12:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoBridgeBlockSet } from '../components/arrays/xyo-bridge-block-set';

export function extractNestedBoundWitnesses(boundWitness: XyoBoundWitness, xyoPacker: XyoPacker) {
  const nestedBoundWitnesses: XyoBoundWitness[] = [];
  recursivelyExtractNestedBoundWitnesses(boundWitness, nestedBoundWitnesses, xyoPacker);
  return nestedBoundWitnesses;
}

/**
 * Often bound-witness pass around origin-chains in their unsigned payloads so they can bridged or
 * archived. This helper function recursively extracts out those origin chains so they can be processed.
 */

function recursivelyExtractNestedBoundWitnesses(
  boundWitness: XyoBoundWitness,
  boundWitnessContainer: XyoBoundWitness[],
  xyoPacker: XyoPacker
) {
  boundWitness.payloads.forEach((payload) => {
    payload.unsignedPayload.array.forEach((unsignedPayloadItem) => {
      const xyoObjectId = unsignedPayloadItem.id;
      if (
        xyoObjectId[0] === XyoBridgeBlockSet.major &&
        xyoObjectId[1] === XyoBridgeBlockSet.minor
      ) {
        const nestedBridgeBlockSet = unsignedPayloadItem as XyoBridgeBlockSet;
        nestedBridgeBlockSet.array.forEach((nestedObj) => {
          const nestedBoundWitness = nestedObj as XyoBoundWitness;
          boundWitnessContainer.push(nestedBoundWitness);
          recursivelyExtractNestedBoundWitnesses(nestedBoundWitness, boundWitnessContainer, xyoPacker);
        });
      }
    });
  });
}
