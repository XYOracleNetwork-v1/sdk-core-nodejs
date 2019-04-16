/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 29th November 2018 5:27:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 
 * @Last modified time: Thursday, 13th December 2018 5:26:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArchivistDynamoRepository } from "./xyo-dynamo-archivist-repository"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IDynamoArchivistRepositoryConfig } from './@types'

export async function createArchivistDynamoRepository(
  config: IDynamoArchivistRepositoryConfig,
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistDynamoRepository(serializationService, config.tableName)
  return repo
}

export { IDynamoArchivistRepositoryConfig } from './@types'
