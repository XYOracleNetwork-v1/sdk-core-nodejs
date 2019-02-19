/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 4:57:38 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 19th February 2019 3:36:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { ISqlConnectionDetails } from '@xyo-network/archivist-repository.sql'

export interface ICreateConfigResult {
  startNode: boolean,
  config: IAppConfig
}

export interface IAppConfig {
  ip: string
  p2pPort: number
  serverPort: number | null
  data: string
  name: string
  graphqlPort: number | null,
  apis: string[]
  bootstrapNodes: string[]
  archivist: {
    sql: ISqlConnectionDetails;
  } | null
  diviner: {
    ethereum: {
      host: string;
      account: string;
      payOnDelivery: string;
    };
  } | null
}
