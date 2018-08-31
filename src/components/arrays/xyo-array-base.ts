/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:25:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 3:46:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoResult } from '../xyo-result';
import { XyoObjectCreator } from '../xyo-object-creator';

export abstract class XyoArrayCreator extends XyoObjectCreator {
  get major () {
    return 0x01;
  }
}

/**
 * A base class for Array types to extend from.
 * Wraps an array-like interface with a class wrapper
 */

// tslint:disable-next-line:max-classes-per-file
export abstract class XyoArrayBase extends XyoObject {

  /** In Major/Minor scheme, if array is strong (homogenous) array it should specify this value */
  public abstract typedId: Buffer | null;

  /** The underlying array collection that is being wrapped */
  public abstract array: XyoObject[];

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
    return XyoResult.withValue(this.makeArray());
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
    return Buffer.concat(
      this.array.map(element => element.typed.value!)
    );
  }

  /**
   * Packs elements of an array together in accordance with the `untyped` protocol
   */

  private mergeUntypedArray() {
    return Buffer.concat([
      this.typedId!,
      ...this.array.map(element => element.unTyped.value!)
    ]);
  }
}
