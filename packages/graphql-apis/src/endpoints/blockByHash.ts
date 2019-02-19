/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 14th February 2019 1:52:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blockByHash.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 14th February 2019 1:58:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { GraphQLResolveInfo } from "graphql"
import { IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"

export const serviceDependencies = [`originBlockRepository`, `hashProvider`]

export default class XyoGetBlockByHashResolver implements IXyoDataResolver<any, any, any, any> {

  public static query = `blockByHash(hash: String!): XyoBlock`
  public static dependsOnTypes = [`XyoBlock`]

  constructor (
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly hashProvider: IXyoHashProvider
  ) {}

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const hexHash = args.hash as string
    const bufferHash = Buffer.from(hexHash, 'hex')
    const block = await this.originBlockRepository.getOriginBlockByHash(bufferHash)
    if (!block) {
      return undefined
    }

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
