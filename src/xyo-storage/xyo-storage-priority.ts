/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 3:56:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: storage-provider.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:46:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export enum XyoStoragePriority {
  /**
   * Used when the write to storage can be slow speed.
   */
  PRIORITY_LOW,

  /**
   * Used when the write to storage must be medium speed.
   */
  PRIORITY_MED,

  /**
   * Used when the write to storage must be high speed.
   */
  PRIORITY_HIGH
}
