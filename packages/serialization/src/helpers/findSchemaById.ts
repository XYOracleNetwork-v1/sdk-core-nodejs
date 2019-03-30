/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 5:04:35 pm
 * @Email:  developer@xyfindables.com
 * @Filename: findSchemaById.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoObjectSchema } from '../@types'

export function findSchemaById(schemaId: number, objectSchema: IXyoObjectSchema) {
  const key = Object.keys(objectSchema).find((schemaKey) => {
    return objectSchema[schemaKey].id === schemaId
  })

  if (!key) {
    throw new XyoError(`Could not find a serializer with id ${schemaId}`)
  }

  return objectSchema[key]
}
