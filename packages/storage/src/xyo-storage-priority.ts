/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 1:12:59 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-storage-priority.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 1:13:20 pm
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
