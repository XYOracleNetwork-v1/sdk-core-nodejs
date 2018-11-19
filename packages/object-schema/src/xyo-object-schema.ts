/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 12:15:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-schema.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 12:44:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoObjectSchema {
  /**
   * How many bytes necessary to encode size of object
   */
  sizeIdentifierSize: 1 | 2 | 4 | 8;

  /**
   * Is the value that is being encoded iterable and if so is it typed
   */
  iterableType: IIterableType;

  /**
   * What is the id of the schema
   */
  id: number
}

export type IIterableType = 'not-iterable' | 'iterable-typed' | 'iterable-untyped';

export interface IXyoReadable {
  getReadableName(): string;
  getReadableValue(): any;
  getReadableJSON(): string;
}