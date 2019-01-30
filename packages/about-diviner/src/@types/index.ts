/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th December 2018 1:17:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 28th January 2019 4:12:14 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSCSCDescription } from '@xyo-network/scsc'

export interface IXyoAboutDiviner {
  name: string
  version: string,
  url: string,
  address: string,
  seeds: string[],
  scsc: IXyoSCSCDescription
}
