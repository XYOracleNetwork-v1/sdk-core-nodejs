/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 4:56:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 11:18:30 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNumberUnsigned } from '../../../xyo-core-components/heuristics/numbers/xyo-number-unsigned';
import { XyoNumberType } from '../../../xyo-core-components/heuristics/numbers/xyo-number-type';

/**
 * The `XyoIndex` corresponds the origin-block number in the
 * origin chain. It is useful for identifying gaps in the origin-chain
 * that are greater than 1. For example, the `previousHash` field provides
 * a link to the previous block but an origin-chain has no way of knowing
 * just how many blocks may be missing downstream of that. The XyoIndex
 * helps in that it can convey that its missing more a chunk of blocks between
 * different indexes.
 */

export class XyoIndex extends XyoNumberUnsigned {

  public static major = 0x02;
  public static minor = 0x05;

  constructor(index: number) {
    super(index, XyoIndex.major, XyoIndex.minor, XyoNumberType.INT);
  }
}
