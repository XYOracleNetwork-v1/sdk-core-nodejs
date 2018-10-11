/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:01:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 1:27:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from './xyo-hash';
import { XyoSerializer } from '../xyo-serialization/xyo-serializer';
import { IXyoHashProvider, IXyoHashFactory } from '../@types/xyo-hashing';

/**
 * A general-purpose XyoHash Serializer class for `XyoHash`
 */

export class XyoHashSerializer extends XyoSerializer<XyoHash> {

  /**
   * Creates an instance of XyoHashSerializer.
   *
   * @param {number} minor The corresponding minor value of the XyoObject
   * @param {number} staticSize The static size of the hash in bytes
   * @param {(IXyoHashProvider | undefined)} hashProvider The corresponding hashProvider
   * @param {IXyoHashFactory} xyoHashFactory A hash-factory
   * @memberof XyoHashSerializer
   */
  constructor(
    private readonly minor: number,
    private readonly staticSize: number,
    private readonly hashProvider: IXyoHashProvider | undefined,
    private readonly xyoHashFactory: IXyoHashFactory
  ) {
    super();
  }

  get description () {
    return {
      major: 0x03,
      minor: this.minor,
      staticSize: this.staticSize,
      sizeIdentifierSize: 0
    };
  }

  /** Get object representation of a XyoHash from bytes */
  public deserialize(buffer: Buffer) {
    return this.xyoHashFactory.newInstance(this.hashProvider, buffer);
  }

  /** Get the bytes representation of a XyoHash from object */
  public serialize(publicKey: XyoHash) {
    return publicKey.hash;
  }
}
