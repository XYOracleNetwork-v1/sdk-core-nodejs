/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 5:27:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 5:26:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArchivistSqlRepository } from "./xyo-sql-archivist-repository"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { SqlService } from "./sql-service"
import { ISqlArchivistRepositoryConfig } from './@types'
import path from 'path'

export async function createArchivistSqlRepository(
  config: ISqlArchivistRepositoryConfig,
  serializationService: IXyoSerializationService
) {
  const sqlService = await SqlService.tryCreateSqlService(
    config,
    path.join(__dirname, '..', 'resources', 'schema.sql')
  )

  const repo = new XyoArchivistSqlRepository(sqlService, serializationService)
  return repo
}

export { ISqlArchivistRepositoryConfig } from './@types'
