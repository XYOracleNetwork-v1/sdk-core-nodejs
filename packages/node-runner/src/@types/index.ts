/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 29th January 2019 10:53:57 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 10:55:53 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoNodeRunnerDelegate {
  /**
   * Runs one iteration of a run-loop
   *
   * @returns {Promise<void>}
   * @memberof IXyoNodeRunnerDelegate
   */
  run(): Promise<void>
  onStop(): Promise<void>
}
