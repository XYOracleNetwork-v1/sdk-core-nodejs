/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:25:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 11:50:18 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoByteArraySetter } from '../xyo-byte-array-setter';

/**
 * A base class for Array types to extend from.
 * Wraps an array-like interface with a class wrapper
 */
export abstract class XyoArrayBase extends XyoObject {

  /** In Major/Minor scheme, if array is strong (homogenous) array it should specify this value */
  public abstract typedId: Buffer | null;

  /** The total number of elements in the array, output in bytes */
  public abstract arraySize: Buffer;

  /** The underlying array collection that is being wrapped */
  public array: XyoObject[] = [];

  /**
   * Returns the total number of element in the array
   */

  get size() {
    return this.array.length;
  }

  /**
   * @returns The binary representation of the array
   */

  get data() {
    return this.makeArray();
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
    if (index !== undefined && index < this.array.length) {
      this.array[index] = element;
      return;
    }

    this.array.push(element);
  }

  /**
   * Removes an element from the underlying collection if it exists
   * @param element The element to remove
   * @returns Returns true if the element was removed, false otherwise
   */

  public removeElement(element: XyoObject): boolean {
    const indexOfElementToRemove = this.array.indexOf(element);
    if (indexOfElementToRemove !== -1) {
      return this.removeElementAtIndex(indexOfElementToRemove);
    }

    return false;
  }

  /**
   * Attempts to remove an element at a specified index
   *
   * @param index The index of the element to remove
   * @returns Returns true if the element was removed, false otherwise
   */

  public removeElementAtIndex(index: number): boolean {
    if (index >= 0 && index < this.array.length) {
      this.array.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Empties the underlying collection
   */

  public removeAll() {
    this.array = [];
  }

  /**
   * @returns the binary representation of the array
   */
  private makeArray(): Buffer {
    if (this.typedId === null) {
      return this.mergeTypedArray();
    }

    return this.mergeUntypedArray();
  }

  /**
   * Packs elements of an array together in accordance with the `typed` protocol
   */

  private mergeTypedArray() {
    const merger = new XyoByteArraySetter(this.array.length + 1);
    merger.add(this.arraySize, 0);
    this.array.forEach((element, index) => {
      merger.add(element.typed, index + 1);
    });

    return merger.merge();
  }

  /**
   * Packs elements of an array together in accordance with the `untyped` protocol
   */

  private mergeUntypedArray() {
    const merger = new XyoByteArraySetter(this.array.length + 2);
    merger.add(this.typedId!, 0);
    merger.add(this.arraySize, 1);

    this.array.forEach((element, index) => {
      merger.add(element.unTyped, index + 2);
    });

    return merger.merge();
  }
}
