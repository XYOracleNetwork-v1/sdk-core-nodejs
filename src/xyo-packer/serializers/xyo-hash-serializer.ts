/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:01:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 10:39:49 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../../components/hashing/xyo-hash';
import { XYOSerializer } from '../xyo-serializer';
import { XyoHashProvider } from '../../lib';

/**
 * The corresponding Creator class for `XyoHash`
 */

export class XyoHashSerializer extends XYOSerializer<XyoHash> {

  constructor(
    private readonly minor: number,
    private readonly staticSize: number,
    private readonly hashProvider: XyoHashProvider | undefined,
    private readonly xyoHashClass: { new(hashProvider: XyoHashProvider | undefined, hash: Buffer): XyoHash}
  ) {
    super();
  }

  get description () {
    return {
      major: 0x03,
      minor: this.minor,
      staticSize: this.staticSize
    };
  }

  public deserialize(buffer: Buffer) {
    return new this.xyoHashClass(this.hashProvider, buffer.slice(2));
  }

  public serialize(publicKey: XyoHash) {
    return publicKey.hash;
  }
}
