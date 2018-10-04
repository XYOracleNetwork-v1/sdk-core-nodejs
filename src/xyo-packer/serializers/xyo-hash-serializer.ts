/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:01:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:25:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../../components/hashing/xyo-hash';
import { XyoSerializer } from '../xyo-serializer';
import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';
import { XyoHashFactory } from '../../hash-provider/hash-types';

/**
 * The corresponding Creator class for `XyoHash`
 */

export class XyoHashSerializer extends XyoSerializer<XyoHash> {

  constructor(
    private readonly minor: number,
    private readonly staticSize: number,
    private readonly hashProvider: XyoHashProvider | undefined,
    private readonly xyoHashFactory: XyoHashFactory
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
