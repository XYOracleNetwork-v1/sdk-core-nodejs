/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:00:03 am
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness-origin-chain-extractor.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 9:04:24 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoSingleTypeArrayInt } from '../components/arrays/xyo-single-type-array-int';

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
      const singleTypeArrayMajorMinor = xyoPacker.getMajorMinor(XyoSingleTypeArrayInt.name);
      const boundWitnessMajorMinor = xyoPacker.getMajorMinor(XyoBoundWitness.name);
      if (
        xyoObjectId[0] === singleTypeArrayMajorMinor.major &&
        xyoObjectId[1] === singleTypeArrayMajorMinor.minor &&
        (unsignedPayloadItem as XyoSingleTypeArrayInt).elementMajor === boundWitnessMajorMinor.major &&
        (unsignedPayloadItem as XyoSingleTypeArrayInt).elementMinor === boundWitnessMajorMinor.minor
      ) {
        const nestedBoundWitnessArray = unsignedPayloadItem as XyoSingleTypeArrayInt;
        nestedBoundWitnessArray.array.forEach((nestedObj) => {
          const nestedBoundWitness = nestedObj as XyoBoundWitness;
          boundWitnessContainer.push(nestedBoundWitness);
          recursivelyExtractNestedBoundWitnesses(nestedBoundWitness, boundWitnessContainer, xyoPacker);
        });
      }
    });
  });
}
