/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 11:05:19 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-strong-array.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 29th August 2018 3:19:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayBase } from './xyo-array-base';
import { XyoObjectCreator } from '../xyo-object-creator';
import { XyoArrayUnpacker } from './xyo-array-unpacker';
import { XyoObject } from '../xyo-object';
import { XyoResult } from '../xyo-result';

/**
 * The corresponding creator for XyoStrongArray
 */
class XyoStrongArrayObjectCreator extends XyoObjectCreator {

  get major () {
    return 0x01;
  }

  get minor () {
    return 0x02;
  }

  get defaultSize () {
    return null;
  }

  get sizeOfSize () {
    return 4;
  }

  public createFromPacked(byteArray: Buffer): XyoObject {
    const unpackedArray = new XyoArrayUnpacker(byteArray, true, 4, 4);
    const unpackedArrayObject = new XyoStrongArray(unpackedArray.majorType!, unpackedArray.minorType!);
    unpackedArrayObject.array = unpackedArray.array;
    return unpackedArrayObject;
  }
}

/**
 * An XyoStrongArray is a collection who's elements are
 * all of the same type. As such, it is packed optimally
 * to have a single size header in the front of the byte-stream.
 *
 * This class encapsulates functionality related to packing
 * and unpacking strong array elements.
 */

// tslint:disable-next-line:max-classes-per-file
export class XyoStrongArray extends XyoArrayBase {

  /**
   * Register XyoStrongArray as a Major/Minor type
   */
  public static enable () {
    XyoStrongArray.creator.enable();
  }

  /**
   * Returns the corresponding major value for this type
   */
  public static major () {
    return XyoStrongArray.creator.major;
  }

  /**
   * Returns the corresponding minor value for this type
   */
  public static minor () {
    return XyoStrongArray.creator.minor;
  }

  /** Creates a creator for this class */
  private static creator = new XyoStrongArrayObjectCreator();

  /**
   * Creates new instance of an XYOStrongArray
   * @param major The corresponding major key for the type of element
   * @param minor The corresponding minor key for the type of element
   */

  constructor(private readonly major: number, private readonly minor: number) {
    super();
  }

  /**
   * Returns the number of elements in the array as an
   * unsigned integer in byte-representation
   */

  get arraySize () {
    const buf = new Buffer(4);
    buf.writeUInt32BE(this.size, 0);
    return buf;
  }

  /**
   * Returns the byte-representation of the id of this type
   * as calculated from the major and minor concatenation
   */

  get typedId () {
    return Buffer.from([this.major, this.minor]);
  }

  /**
   * Returns the byte-representation of the id of this type
   * as calculated from the major and minor concatenation
   */

  get id () {
    return Buffer.from([this.major, this.minor]);
  }

  /**
   * Returns the number of bytes needed to represent the
   * size element. Either 2, 4 or 8
   */

  get sizeIdentifierSize () {
    return XyoResult.withResult(XyoStrongArray.creator.sizeOfSize);
  }

  // Override addElement to make sure its the right type before adding it to the collection
  public addElement(element: XyoObject, index?: number) {
    if (element.id[0] === this.major && element.id[1] === this.minor) {
      return super.addElement(element, index);
    }

    throw new Error(`Element could not be added to array, wrong type`);
  }
}
