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

import { XyoArchivistNeo4jRepository } from "./xyo-neo4j-archivist-repository"
import { IXyoSerializationService } from "@xyo-network/serialization"
import path from 'path'

export async function createArchivistNeo4jRepository(
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistNeo4jRepository(serializationService)
  return repo
}
