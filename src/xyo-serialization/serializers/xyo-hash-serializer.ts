/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:01:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:12:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../../xyo-hashing/xyo-hash';
import { XyoSerializer } from '../xyo-serializer';
import { IXyoHashProvider, IXyoHashFactory } from '../../@types/xyo-hashing';

/**
 * The corresponding Creator class for `XyoHash`
 */

export class XyoHashSerializer extends XyoSerializer<XyoHash> {

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

  public deserialize(buffer: Buffer) {
    return this.xyoHashFactory.newInstance(this.hashProvider, buffer);
  }

  public serialize(publicKey: XyoHash) {
    return publicKey.hash;
  }
}
