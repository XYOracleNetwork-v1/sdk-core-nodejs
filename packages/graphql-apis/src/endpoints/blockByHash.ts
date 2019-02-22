/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 14th February 2019 1:52:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blockByHash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 22nd February 2019 2:23:24 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { GraphQLResolveInfo } from "graphql"
import { IXyoHashProvider, IXyoHash } from "@xyo-network/hashing"
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { IXyoArchivistNetwork } from '@xyo-network/archivist-network'
import { IXyoBoundWitness } from "@xyo-network/bound-witness"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { XyoBase } from "@xyo-network/base"

export const serviceDependencies = [
  `originBlockRepository`,
  `hashProvider`,
  `serializationService`,
  `archivistNetwork?`
]

export default class XyoGetBlockByHashResolver extends XyoBase implements IXyoDataResolver<any, any, any, any> {

  public static query = `blockByHash(hash: String!): XyoBlock`
  public static dependsOnTypes = [`XyoBlock`]

  constructor (
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly hashProvider: IXyoHashProvider,
    private readonly serializationService: IXyoSerializationService,
    private readonly archivistNetwork?: IXyoArchivistNetwork,
  ) {
    super()
  }

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const hexHash = args.hash as string
    const bufferHash = Buffer.from(hexHash, 'hex')
    let block: IXyoBoundWitness | undefined

    try {
      block = await this.originBlockRepository.getOriginBlockByHash(bufferHash)
    } catch (e) {
      // swallow error
    }

    if (!block) {
      if (this.archivistNetwork) {
        const archivists = this.archivistNetwork
        try {
          const hash = this.serializationService.deserialize(bufferHash).hydrate<IXyoHash>()
          block = await archivists.getBlock(hash)
        } catch (e) {
          this.logError(`There was an error deserializing the hash`, e)
        }
      }
    }

    if (!block) return undefined

    return {
      humanReadable: block.getReadableValue(),
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
