/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 4:56:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 12:45:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNumberUnsigned } from './xyo-number-unsigned';
import { XyoNumberType } from './xyo-number-type';

/**
 * The `XyoIndex` corresponds the origin-block number in the
 * origin chain
 *
 * @major 0x02
 * @minor 0x05
 */

export class XyoIndex extends XyoNumberUnsigned {

  constructor(index: number) {
    super(index, 0x02, 0x05, XyoNumberType.INT);
  }
}
