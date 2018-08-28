/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 1:53:39 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 8:59:14 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoType } from './xyo-type';
import { XyoObject } from './xyo-object';

export abstract class XyoObjectCreator extends XyoType {

  public static create(data: Buffer): XyoObject | null {
    const major = data.readUInt8(0);
    const minor = data.readUInt8(1);
    const creator = XyoObjectCreator.getCreator(major, minor);

    return (creator && creator.createFromPacked(data)) || null;
  }

  public static getCreator(major: number, minor: number): XyoObjectCreator | null {
    const minorsMap = XyoObjectCreator.creators[String(major)];
    if (!minorsMap) {
      return null;
    }

    return minorsMap[String(minor)] || null;
  }

  public static registerCreator(major: number, minor: number, creator: XyoObjectCreator) {
    const minorMap = XyoObjectCreator.creators[String(major)] || {};
    minorMap[String(minor)] = creator;
    XyoObjectCreator.creators[String(major)] = minorMap;
  }

  private static creators: {[major: string]: {[minor: string]: XyoObjectCreator}} = {};

  public abstract defaultSize: number | null;
  public abstract sizeOfSize: number | null;
  public abstract createFromPacked(params: Buffer): XyoObject;

  public enable() {
    XyoObjectCreator.registerCreator(this.major, this.minor, this);
  }
}
