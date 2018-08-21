/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 21st August 2018 1:53:39 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-object-creator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 21st August 2018 2:16:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOType } from './xyo-type';
import { XYOObject } from './xyo-object';

export abstract class XYOObjectCreator extends XYOType {

  public static create(data: Buffer): XYOObject | null {
    const major = data.readUInt8(0);
    const minor = data.readUInt8(1);
    const creator = XYOObjectCreator.getCreator(major, minor);

    return (creator && creator.createFromPacked(data)) || null;
  }

  public static getCreator(major: number, minor: number): XYOObjectCreator | null {
    const minorsMap = XYOObjectCreator.creators[String(major)];
    if (!minorsMap) {
      return null;
    }

    return minorsMap[String(minor)] || null;
  }

  public static registerCreator(major: number, minor: number, creator: XYOObjectCreator) {
    const minorMap = XYOObjectCreator.creators[String(major)] || {};
    minorMap[String(minor)] = creator;
    XYOObjectCreator.creators[String(major)] = minorMap;
  }

  private static creators: {[major: string]: {[minor: string]: XYOObjectCreator}} = {};

  public abstract defaultSize: number;
  public abstract sizeOfSize: number;
  public abstract createFromPacked(params: Buffer): XYOObject;

  public enable() {
    XYOObjectCreator.registerCreator(this.major, this.minor, this);
  }
}
