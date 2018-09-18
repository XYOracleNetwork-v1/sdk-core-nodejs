/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 10:38:56 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-previous-hash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 12:43:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoHash } from './xyo-hash';

/**
 * The previous-hash concept is a very important part of the preserving
 * the origin chain the in XYO protocol. Given a previous-hash value one
 * can trace back the ordering of origin-blocks.
 */

export class XyoPreviousHash extends XyoObject {

  /**
   * Creates a new instance of a `XyoPreviousHash`
   *
   * @param hash The previous hash in the origin chain
   */

  constructor (public readonly hash: XyoHash) {
    super(0x02, 0x06);
  }
}
