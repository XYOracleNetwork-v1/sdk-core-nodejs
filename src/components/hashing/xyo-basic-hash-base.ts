/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 23rd August 2018 9:39:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-basic-hash-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:15:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash, XyoHashCreator } from './xyo-hash';
import crypto from 'crypto';
import { XyoResult } from '../xyo-result';
import { XyoError } from '../xyo-error';

/**
 * A base class for concrete Hash classes to extend from
 */
export abstract class XyoBasicHashBase extends XyoHash {

  /** Hash value in bytes */
  private readonly mHash: Buffer;

  /**
   * Creates new instance of XyoBasicHashBase and initializes it with
   * the hash that has already been calculated `pastHash`
   *
   * @param pastHash An already calculated hash value
   */

  constructor(pastHash: Buffer) {
    super();
    this.mHash = pastHash;
  }

  /**
   * Get the value for the underlying hash
   */

  get hash () {
    return this.mHash;
  }

  /**
   * Size identifier is already known, returns `null`
   */

  get sizeIdentifierSize () {
    return XyoResult.withResult(null);
  }
}

/**
 * The creator class for all Basic Hash's
 */
// tslint:disable-next-line:max-classes-per-file
export class XyoBasicHashBaseCreator extends XyoHashCreator {

  /**
   *  Creates a new instance of a XyoBasicHashBaseCreator
   *
   * @param standardDigestKey The name of the hashing algorithm. i.e. `md5` or `sha256`
   * @param defaultSize The size in bytes of the length of the hash output
   * @param minor The corresponding minor value for the Hash type
   */

  constructor(
    public readonly standardDigestKey: string,
    public readonly defaultSize: number,
    public readonly minor: number
  ) {
    super();
  }

  /**
   * Returns null because it already known and is not dynamic
   */

  get sizeOfBytesToGetSize () {
    return null;
  }

  /**
   * Creates a hash value from the data passed.
   *
   * @param data The data to get a hash for
   * @returns Returns an `XyoBasicHash` wrapped in `XyoResult`.
   *          The value found in the result corresponds to hash value.
   *          If an error has occurred, it will be found the error value.
   */

  public async createHash(data: Buffer) {
    try {
      const hash = new XyoBasicHashBaseImpl(
        this.hash(data),
        Buffer.from([this.major, this.minor])
      );

      return XyoResult.withResult(hash);
    } catch (e) {
      return XyoResult.withError<XyoBasicHashBaseImpl>(
        new XyoError(e.message, XyoError.errorType.ERR_CRITICAL, e)
      );
    }
  }

  /**
   * Creates a has from the data provided
   * @param data The data to hash
   */

  public hash(data: Buffer): Buffer {
    const hasher = crypto.createHash(this.standardDigestKey);
    hasher.update(data);
    return hasher.digest();
  }

  /**
   * Unpacks the packed value into an XyoHash value corresponding to the major
   * and minor values embedded in byte-stream
   *
   * @param byteArray The packed byte-array
   */

  public createFromPacked(byteArray: Buffer): XyoHash {
    const hash = Buffer.from(byteArray, 2, byteArray.length - 2);
    return new XyoBasicHashBaseImpl(hash, Buffer.from([byteArray[0], byteArray[1]]));
  }
}

/**
 * A wrapper clash for hash values
 */
// tslint:disable-next-line:max-classes-per-file
class XyoBasicHashBaseImpl extends XyoBasicHashBase {

  /**
   * Creates an instance of XyoBasicHashBaseImpl
   *
   * @param pastHash A previously calculated hash value
   * @param id The id corresponding to the concatenation of the major minor type.
   */

  constructor(pastHash: Buffer, private readonly rawId: Buffer) {
    super(pastHash);
  }

  get id () {
    return XyoResult.withResult(this.rawId);
  }
}
