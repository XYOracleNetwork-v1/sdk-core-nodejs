/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 22nd August 2018 9:25:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-array-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 22nd August 2018 11:32:33 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOObject } from '../xyo-object';
import { XYOByteArraySetter } from '../xyo-byte-array-setter';

export abstract class XYOArrayBase extends XYOObject {
  public abstract typedId: Buffer | null;
  public abstract arraySize: Buffer;

  public array: XYOObject[] = [];

  get size() {
    return this.array.length;
  }

  get data() {
    return this.makeArray();
  }

  public getElement(index: number): XYOObject | undefined {
    if (index < this.array.length) {
      return this.array[index];
    }

    return undefined;
  }

  public addElement(element: XYOObject, index?: number) {
    if (index !== undefined && index < this.array.length) {
      this.array[index] = element;
      return;
    }

    this.array.push(element);
  }

  public removeElement(element: XYOObject): boolean {
    const indexOfElementToRemove = this.array.indexOf(element);
    if (indexOfElementToRemove !== -1) {
      return this.removeElementAtIndex(indexOfElementToRemove);
    }

    return false;
  }

  public removeElementAtIndex(index: number): boolean {
    if (index >= 0 && index < this.array.length) {
      this.array.splice(index, 1);
      return true;
    }

    return false;
  }

  public removeAll() {
    this.array = [];
  }

  private makeArray(): Buffer {
    if (this.typedId === null) {
      return this.mergeTypedArray();
    }

    return this.mergeUntypedArray();
  }

  private mergeTypedArray() {
    const merger = new XYOByteArraySetter(this.array.length + 1);
    merger.add(this.arraySize, 0);
    this.array.forEach((element, index) => {
      merger.add(element.typed, index + 1);
    });

    return merger.merge();
  }

  private mergeUntypedArray() {
    const merger = new XYOByteArraySetter(this.array.length + 2);
    merger.add(this.typedId!, 0);
    merger.add(this.arraySize, 1);

    this.array.forEach((element, index) => {
      merger.add(element.unTyped, index + 2);
    });

    return merger.merge();
  }
}
