/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th December 2018 4:02:23 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 28th January 2019 1:08:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoMetaList } from '@xyo-network/meta-list'

export interface IXyoDivinerArchivistClient {
  getIntersections(
    publicKeyA: string,
    publicKeyB: string,
    limit: number,
    cursor: string | undefined
  ): Promise<IXyoMetaList<string>>

  getBlockBytesFromHash(hash: string): Promise<string>
}

export interface IXyoDivinerArchivistClientProvider {
  getArchivistClients(max: number): Promise<IXyoDivinerArchivistClient[]>
}
