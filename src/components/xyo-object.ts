/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 12:45:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st September 2018 10:54:40 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * An XyoObject is integral in the xyo protocol. All subclasses
 * will have an id which is important for the serialization process
 */

import { XyoBase } from './xyo-base';
export abstract class XyoObject extends XyoBase {

  constructor (public readonly major: number, public readonly minor: number) {
    super();
  }

  /**
   * @returns The id of the `XyoObject`, which is concatenation of the major & minor values
   */

  get id (): Buffer {
    return Buffer.from([this.major, this.minor]);
  }
}
