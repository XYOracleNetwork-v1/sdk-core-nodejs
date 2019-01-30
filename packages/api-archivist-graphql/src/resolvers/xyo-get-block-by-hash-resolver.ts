/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 12th December 2018 12:37:14 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-get-block-by-hash-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 28th January 2019 1:00:55 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { GraphQLResolveInfo } from "graphql"
import { IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoArchivistRepository } from "@xyo-network/archivist-repository"

export class XyoGetBlockByHashResolver implements IXyoDataResolver<any, any, any, any> {
  constructor (
    private readonly archivistRepository: IXyoArchivistRepository,
    private readonly hashProvider: IXyoHashProvider
  ) {}

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const hexHash = args.hash as string
    const bufferHash = Buffer.from(hexHash, 'hex')
    const block = await this.archivistRepository.getOriginBlockByHash(bufferHash)
    if (!block) {
      return undefined
    }

    return {
      bytes: block.serializeHex(),
      publicKeys: block.publicKeys.map((keyset) => {
        return {
          array: keyset.keys.map((key) => {
            return {
              value: key.serializeHex(),
            }
          })
        }
      }),
      signatures: block.signatures.map((sigSet) => {
        return {
          array: sigSet.signatures.map((sig) => {
            return {
              value: sig.serializeHex()
            }
          })
        }
      }),
      heuristics: block.heuristics.map((heuristicSet) => {
        return {
          array: heuristicSet.map((heuristic) => {
            return {
              value: heuristic.serializeHex()
            }
          })
        }
      }),
      signedHash: (await this.hashProvider.createHash(block.getSigningData())).serializeHex()
    }
  }
}
