/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 9th October 2018 11:21:33 am
 * @Email:  developer@xyfindables.com
 * @Filename: hashing.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 10th October 2018 4:09:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from "../xyo-hashing/xyo-hash";

/**
 * A uniform interface for creating XyoHash instances
 */

export interface IXyoHashFactory {

  /**
   * Given a hash-provider and a hash, returns a new XyoHash instance
   */
  newInstance(hashProvider: IXyoHashProvider | undefined, hash: Buffer): XyoHash;
}

/**
 * The interface for hashing providers in the system.
 * All hash algorithms must implement this interface so
 * that is can be used as an XyoHashProvider in the system
 */

export interface IXyoHashProvider {

  /**
   * Creates a hash for a particular piece of data.
   * Returns an instance of an XyoHash asynchronously
   */

  createHash(data: Buffer): Promise<XyoHash>;

  /**
   * Given a raw piece of data and the raw hash, will return
   * a boolean value asynchronously as to whether the hash
   * corresponds to the data for this hash-provider
   */

  verifyHash(data: Buffer, hash: Buffer): Promise<boolean>;
}
