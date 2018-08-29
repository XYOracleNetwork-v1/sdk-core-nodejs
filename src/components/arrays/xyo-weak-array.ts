/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:50:27 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-weak-array.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 4:29:00 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayBase } from './xyo-array-base';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoObject } from '../xyo-object';
import { XyoArrayUnpacker } from './xyo-array-unpacker';
import { XyoResult } from '../xyo-result';

/**
 * The corresponding creator for XyoWeakArray
 */
class XyoWeakArrayObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x01;
  }

  get minor () {
    return 0x03;
  }

  get defaultSize () {
    return null;
  }

  get sizeOfBytesToGetSize () {
    return 4;
  }

  public createFromPacked(byteArray: Buffer) {
    const unpackedArray = new XyoArrayUnpacker(byteArray, false, 4, 4);
    const unpackedArrayObject = new XyoWeakArray();
    unpackedArrayObject.array = unpackedArray.array;
    return XyoResult.withValue(unpackedArrayObject);
  }
}
/**
 * An XyoWeakArray is a collection of elements of different types.
 * As such, each element must have its own header in the packer that
 * provides meta data as to what's its type, and optionally a size field
 *
 * This class encapsulates functionality related to packing
 * and unpacking weak array elements.
 */

// tslint:disable-next-line:max-classes-per-file
export class XyoWeakArray extends XyoArrayBase {

  /**
   * Register XyoWeakArray as a Major/Minor type
   */

  public static enable () {
    XyoWeakArray.creator.enable();
  }

  /**
   * Returns the corresponding major value for this type
   */

  public static major () {
    return XyoWeakArray.creator.major;
  }

  /**
   * Returns the corresponding minor value for this type
   */

  public static minor () {
    return XyoWeakArray.creator.minor;
  }

  /** Creates a creator for this class */
  private static creator = new XyoWeakArrayObjectCreator();

  /**
   * Returns the number of elements in the array as an
   * unsigned integer in byte-representation
   */

  get arraySize () {
    const buffer = new Buffer(4);
    buffer.writeUInt32BE(this.size, 0);
    return buffer;
  }

  /**
   * Since the element types vary, the `typedId` for XyoWeakArray
   * returns null
   */

  get typedId () {
    return null;
  }

  /**
   * Returns the byte-representation of the id of this type
   * as calculated from the major and minor concatenation
   */

  get id () {
    return XyoResult.withValue(Buffer.from([XyoWeakArray.creator.major, XyoWeakArray.creator.minor]));
  }

  /**
   * Returns the number of bytes needed to represent the
   * size element. Either 2, 4 or 8
   */

  get sizeIdentifierSize () {
    return XyoResult.withValue(XyoWeakArray.creator.sizeOfBytesToGetSize);
  }
}
