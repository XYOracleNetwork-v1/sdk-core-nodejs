/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 1:18:58 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-signature-set.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 5:20:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObject } from '../../../xyo-core-components/xyo-object';
import { XyoArray } from '../../../xyo-core-components/arrays/xyo-array';

/**
 * An XyoSignatureSet is a collection of non-homogenous
 * signatures who's total size should not exceed 2 ^ 16 - 1 bytes when packed.
 *
 * A `XyoSignatureSet` is generally used in bound-witnesses for verification
 * that two parties agreed on the same data in the signed payload.
 */

export class XyoSignatureSet extends XyoArray {

  public static major = 0x02;
  public static minor = 0x03;

  /**
   * Creates a new instance of a XyoSignatureSet
   *
   * @param array A collection of signatures
   */

  constructor (public readonly array: IXyoObject[]) {
    super(undefined, undefined, XyoSignatureSet.major, XyoSignatureSet.minor, 2, array);
  }

  public getReadableName(): string {
    return 'signatureSet';
  }

  public getReadableValue() {
    return this.array;
  }
}
