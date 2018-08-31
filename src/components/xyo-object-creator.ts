/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 1:53:39 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 31st August 2018 1:45:32 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoType } from './xyo-type';
import { XyoObject } from './xyo-object';
import { XyoResult } from './xyo-result';
import { XyoError } from './xyo-error';

/**
 * Abstract `XyoObjectCreator`. Provides factory-like services
 * for initializing objects from an arbitrary set of bytes
 * following the Major/Minor XYO protocol
 */

export abstract class XyoObjectCreator extends XyoType {

  /**
   * Create an XyoObject from a Buffer
   * @param data A packed byte-stream following the Xyo Major/Minor Protocol
   */

  public static create(data: Buffer): XyoResult<XyoObject | null> {
    const major = data.readUInt8(0);
    const minor = data.readUInt8(1);
    const creator = XyoObjectCreator.getCreator(major, minor);

    if (creator) {
      return XyoResult.withValue(creator.createFromPacked(data).value!);
    }

    return XyoResult.withError(
      new XyoError(`Could not creat from Buffer ${this.name}`, XyoError.errorType.ERR_CREATOR_MAPPING)
    );
  }

  /**
   * Locates an XyoObjectCreator if it has been enabled
   * @param major The major value
   * @param minor The minor value
   * @returns Will return the creator if it has been registered. Otherwise it will return `null`
   */

  public static getCreator(major: number, minor: number): XyoObjectCreator | null {
    const minorsMap = XyoObjectCreator.creators[String(major)];
    if (!minorsMap) {
      return null;
    }

    return minorsMap[String(minor)] || null;
  }

  /**
   * Registers a creator by major/minor
   * @param major The major value
   * @param minor The minor value
   * @param creator A creator
   */

  public static registerCreator(major: number, minor: number, creator: XyoObjectCreator) {
    const minorMap = XyoObjectCreator.creators[String(major)] || {};
    minorMap[String(minor)] = creator;
    XyoObjectCreator.creators[String(major)] = minorMap;
  }

  /** A mapping of creators by their major/minor values */
  private static creators: {[major: string]: {[minor: string]: XyoObjectCreator}} = {};

  /**
   * For dynamically sized types, this value functions as a size pointer,
   * corresponding to amount bytes needed to represent the size of the type
   */
  public abstract sizeOfBytesToGetSize: XyoResult<number | null>;

  /** The default size of the type that is to be created. If it is a dynamic size, null should be returned */
  public abstract readSize(buffer: Buffer): XyoResult<number | null>;

  /**
   * A creator's primary function is to take packed binary data and return a hydrated
   * representation of that object
   * @param params The packed binary data
   * @returns Should return an `XyoObject` if the data can be unpacked
   */
  public abstract createFromPacked(params: Buffer): XyoResult<XyoObject>;

  /**
   * Registers the creator for the major and minor values
   */

  public enable() {
    XyoObjectCreator.registerCreator(this.major, this.minor, this);
  }
}
