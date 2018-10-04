/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 5:02:19 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-rssi.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:17:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNumberSigned } from './xyo-number-signed';
import { XyoNumberType } from './xyo-number-type';

/**
 * An XyoRssi concept corresponds to the signal strength between
 * two networked objects. This is a negative, one-byte, number, and it is a proxy
 * for proximity. It is useful in determining relative location of nodes
 * in a network.
 *
 * @major: 0x08
 * @minor: 0x01
 */
export class XyoRssi extends XyoNumberSigned {

  public static major = 0x08;
  public static minor = 0x01;

  /**
   * Creates a new instance of a XyoRssi class
   *
   * @param rssi The numeric value representing rssi value
   */

  constructor(rssi: number) {
    super(rssi, XyoRssi.major, XyoRssi.minor, XyoNumberType.BYTE);
  }
}
