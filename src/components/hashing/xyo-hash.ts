/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 9:24:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:29:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoResult } from '../xyo-result';
import { XyoError } from '../xyo-error';

/**
 * Wraps a XyoHash value. Additionally, adds a `verifyHash`
 * instance method that can be used to verify the hash value matches
 * against a set of data
 */
export abstract class XyoHash extends XyoObject {
  /** The previously hashed value, represented as a byte-stream */
  public abstract hash: Buffer;

  /**
   * Returns the byte-representation of the underlying hash value
   */

  get data () {
    return XyoResult.withValue(this.hash);
  }

  /**
   * Verifies that a hash matches to a source data.
   *
   * @param data The source data to compare to
   */

  public async verifyHash(data: Buffer): Promise<XyoResult<boolean>> {
    const hashCreator = XyoObjectCreator.getCreator(this.id.value![0], this.id.value![1]) as XyoHashCreator;
    if (!hashCreator) {
      return XyoResult.withError(new XyoError(
        `Could not create an XyoHashCreator for Major: ${this.id.value![0]} and minor ${this.id.value![1]}`,
        XyoError.errorType.ERR_CREATOR_MAPPING
      ));
    }

    return XyoResult.withValue(hashCreator.hash(data).equals(this.hash));
  }
}

/**
 * The corresponding Creator class for `XyoHash`
 */
// tslint:disable-next-line:max-classes-per-file
export abstract class XyoHashCreator extends XyoObjectCreator {

  /**
   * All hashes will be of the major value `0x04`
   */

  get major () {
    return 0x04;
  }

  /**
   * Subclasses should implement this class-method.
   * Should apply a hashing transform to the data and return the transform result as buffer.
   *
   * @param data The data to hash
   */

  public abstract hash(data: Buffer): Buffer;

  /**
   * Subclasses should implement this class-method.
   * Creates an XyoHash from the data provided
   *
   * @param data The data to hash
   */
  public abstract createHash(data: Buffer): Promise<XyoResult<XyoHash>>;
}
