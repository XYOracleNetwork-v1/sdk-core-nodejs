/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 12:45:24 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:25:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * An XyoObject is integral in the xyo protocol. All subclasses
 * will have an id which is important for the serialization process
 */

import { XyoBase } from './xyo-base';
import { XyoPacker } from '../xyo-serialization/xyo-packer';
import { XyoError, XyoErrors } from './xyo-error';
import { XyoSerializer } from '../xyo-serialization/xyo-serializer';

export abstract class XyoObject extends XyoBase {

  public static major: number; // Should be overridden by subclasses
  public static minor: number;

  public static get packer(): XyoPacker {
    if (!this.mPacker) {
      throw new XyoError(`Packer not set set on XyoObject prototype`, XyoErrors.CRITICAL);
    }

    return this.mPacker;
  }

  public static set packer(packer: XyoPacker) {
    if (this.mPacker) {
      XyoObject.logger.warn(`Overriding packer when packer already set`);
    }

    this.mPacker = packer;
  }

  /**
   * Deserialize a bytes representation of an XyoObject into an object representation
   *
   * @static
   * @template T
   * @param {Buffer} buffer
   * @returns {T}
   * @memberof XyoObject
   */

  public static deserialize<T extends XyoObject>(buffer: Buffer): T {
    return XyoObject.packer.deserialize(buffer);
  }

  public static getSerializerByMajorMinor<T extends XyoObject>(
    major: number,
    minor: number
  ): XyoSerializer<T> | undefined {
    return XyoObject.packer.getSerializerByMajorMinor<T>(major, minor);
  }

  public static getSerializer<T extends XyoObject>(): XyoSerializer<T> {
    const s = XyoObject.getSerializerByMajorMinor<T>(this.major, this.minor);
    if (s) {
      return s;
    }

    throw new XyoError(
      `Could not find serializer with major/minor ${this.major} / ${this.minor}`, XyoErrors.CREATOR_MAPPING
    );

  }

  private static mPacker: XyoPacker;

  constructor (public readonly major: number, public readonly minor: number) {
    super();
  }

  /**
   * Returns Byte representation of object
   * @param {boolean} [typed] true if typed, false if untyped, undefined for raw
   * @memberof XyoObject
   */

  public serialize(typed?: boolean): Buffer {
    return XyoObject.packer.serialize(this, typed);
  }

  public abstract getReadableName(): string;
  public abstract getReadableValue(): any;

  /**
   * @returns The id of the `XyoObject`, which is concatenation of the major & minor values
   */

  get id (): Buffer {
    return Buffer.from([this.major, this.minor]);
  }

  public isEqual(other: XyoObject) {
    if (!this.id.equals(other.id)) {
      return false;
    }

    if (!XyoObject.packer) {
      throw new XyoError(`Packer not set set on XyoObject prototype`, XyoErrors.CRITICAL);
    }

    return XyoObject.packer.serialize(this, true).equals(XyoObject.packer.serialize(other, true));
  }

  public getReadableJSON() {
    return XyoBase.stringify({
      [this.getReadableName()]: this.recursivelyGetReadableValue(this.getReadableValue())
    });
  }

  private recursivelyGetReadableValue(readableValue: any): any {
    if (readableValue === null || readableValue === undefined) {
      return readableValue;
    }

    const type = typeof readableValue;

    switch (type) {
      case 'string':
        return readableValue;
      case 'number':
        return readableValue;
      case 'boolean':
        return readableValue;
      case 'symbol':
        return readableValue;
      case 'function':
        return readableValue.toString();
      case 'object':
        if (readableValue instanceof XyoObject) {
          const nestedReadValue = readableValue as XyoObject;
          return {
            [nestedReadValue.getReadableName()]: this.recursivelyGetReadableValue(nestedReadValue.getReadableValue())
          };
        }

        if (readableValue instanceof Buffer) {
          return readableValue.toString('hex');
        }

        if (Array.isArray(readableValue)) {
          return readableValue.map(i => this.recursivelyGetReadableValue(i));
        }

        // must be object
        return Object.keys(readableValue).reduce((memo: {[s: string]: any}, objKey) => {
          memo[objKey] = this.recursivelyGetReadableValue(readableValue[objKey]);
          return memo;
        }, {});
    }

    throw new XyoError(`Could not serialize type ${type}`, XyoErrors.CRITICAL);
  }
}
