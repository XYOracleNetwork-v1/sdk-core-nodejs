/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:50:45 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-origin-block.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:39:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { getBufferHash } from '../utils/xyo-buffer-utils';
import { XyoPreviousHash } from '../components/hashing/xyo-previous-hash';
import { XyoPacker } from '../xyo-packer/xyo-packer';

/**
 * An XyoOriginBlock represents a single block in an origin chain belonging to a
 * particular node on the xyo network
 */

export class XyoOriginBlock {

  /**
   * Creates a new instance of a XyoOriginBlock
   *
   * @param xyoPacker A packer for serializing and deserializing
   * @param boundWitness The bound witness data that comprises this origin block
   */

  constructor(private readonly xyoPacker: XyoPacker, private readonly boundWitness: XyoBoundWitness) {}

  /**
   * Given an origin block, this will return the hashes of the origin blocks that came before
   */

  public findPreviousBlocks() {
    const previousHashes: Array<Buffer | undefined> = []; // tslint:disable-line:prefer-array-literal

    this.boundWitness.payloads.map((payload) => {
      /** Gets a map where the keys are the hash values of the type ids and the values are the actual data elements */
      const signedPayloadValue = payload.signedPayloadMapping;

      /** Get the major and minor values for the previous hash type */
      const { major, minor } = XyoPreviousHash;

      /** Turn that into an id by concatenating the values */
      const id = Buffer.from([major, minor]);

      /** Get the hash-value of the previous-hash type id */
      const idHashValue = String(getBufferHash(id));

      /** Retrieve the value, if it exists add it to the previous hash list */
      const signedPayload = signedPayloadValue[idHashValue];
      if (signedPayload) {
        previousHashes.push(this.xyoPacker.serialize(signedPayload, false));
      }
    });

    return previousHashes;
  }
}
