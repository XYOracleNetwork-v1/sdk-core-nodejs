/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 1:03:44 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 1:20:35 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-classes-per-file

import { XyoObject } from '../xyo-object';
import { XyoError, XyoErrors } from '../xyo-error';

/**
 * A wrapper for collections / arrays in the XyoNetwork.
 */
export class XyoArray extends XyoObject {

  /**
   * Creates a new instance of an XyoArray
   *
   * @param elementMajor If this is a homogenous collection, the major id of the collection-item, `undefined` otherwise
   * @param elementMinor If this is a homogenous collection, the minor id of the collection-item, `undefined` otherwise
   * @param major The major value of the collection
   * @param minor The minor value of the collection
   * @param sizeIdentifierSize The size of size value to describe how big the collection is in bytes.
   * @param array The underlying array/collection
   */

  constructor(
    public readonly elementMajor: number | undefined,
    public readonly elementMinor: number | undefined,
    public readonly major: number,
    public readonly minor: number,
    public readonly sizeIdentifierSize: number,
    public readonly array: XyoObject[]
  ) {
    super(major, minor);
  }

  /**
   * The id of the collection-items if it is a typed array, `undefined` otherwise
   */

  get typedId () {
    if (this.elementMajor !== undefined && this.elementMinor !== undefined) {
      return Buffer.from([
        this.elementMajor,
        this.elementMinor
      ]);
    }

    return undefined;
  }

  /**
   * Returns the total number of element in the array
   */

  get size() {
    return this.array.length;
  }

  /**
   * Gets an element from the underlying collection by index
   * @param index The index of the element to access
   * @returns Returns the element at the index if it exists. Otherwise, undefined
   */

  public getElement(index: number): XyoObject | undefined {
    if (index < this.array.length) {
      return this.array[index];
    }

    return undefined;
  }

  /**
   * Add an element to the collection
   *
   * @param element The element to add to the collection
   * @param index If an index is specified, it will add the element at specified index.
   *              Otherwise it push the element into the back of the collection
   */

  public addElement(element: XyoObject, index?: number) {
    if (this.typedId !== undefined && element.id[0] !== this.elementMajor || element.id[1] !== this.elementMinor) {
      throw new XyoError('Can not add element to array, mismatched type', XyoErrors.INVALID_PARAMETERS);
    }

    if (index !== undefined && index < this.array.length) {

      this.array[index] = element;
      return;
    }

    this.array.push(element);
  }
}
