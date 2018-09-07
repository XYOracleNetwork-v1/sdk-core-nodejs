/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 4:01:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-hash-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:56:47 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from '../../components/hashing/xyo-hash';
import { XYOSerializer } from '../xyo-serializer';
import { XyoHashToHashProviderMap } from '../../components/hashing/xyo-hash-to-hash-provider-map';

/**
 * The corresponding Creator class for `XyoHash`
 */

export class XyoHashSerializer extends XYOSerializer<XyoHash> {

  constructor(
    private readonly minor: number,
    private readonly staticSize: number,
    private readonly hashToHashProviderMap: XyoHashToHashProviderMap
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
    const hash = buffer.slice(2);
    return new XyoHash(this.hashToHashProviderMap, hash, buffer[0], buffer[1]);
  }

  public serialize(publicKey: XyoHash) {
    return publicKey.hash;
  }
}
