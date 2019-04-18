/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 2:50:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blocksByPublicKey.ts

 * @Last modified time: Thursday, 14th February 2019 2:53:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHashProvider } from '@xyo-network/hashing'
import { IXyoDataResolver } from "@xyo-network/graphql-server"
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoPublicKey } from '@xyo-network/signing'
import { XyoBase } from '@xyo-network/base'
import { IXyoArchivistRepository } from '@xyo-network/sdk-archivist-nodejs'

export const serviceDependencies = [`archivistRepository`, `hashProvider`, `serializationService`]

export default class XyoGetBlocksByPublicKeyResolver extends XyoBase implements IXyoDataResolver<any, any, any, any> {

  public static query = `blocksByPublicKey(publicKeys: [String!]): [XyoBlockCollection]`
  public static dependsOnTypes = [`XyoBlockCollection`]

  constructor(
    private readonly archivistRepository: IXyoArchivistRepository,
    protected readonly hashProvider: IXyoHashProvider,
    protected readonly serializationService: IXyoSerializationService
  ) {
    super()
  }

  public async resolve (obj: any, args: any, context: any, info: any): Promise<any> {
    if (!args || !args.publicKeys || !args.publicKeys.length) {
      return []
    }

    const blocks = await Promise.all((args.publicKeys as string[]).map(async (publicKey) => {
      const innerBlocks = await this.getBlockCollectionForPublicKey(publicKey)
      return {
        publicKey,
        publicKeySet: innerBlocks.keySet,
        blocks: innerBlocks.blocks
      }
    }))

    return blocks
  }

  private async getBlockCollectionForPublicKey(publicKey: string) {
    try {
      const blocksByPublicKeySet = await this.archivistRepository.getOriginBlocksByPublicKey(
        this.serializationService.deserialize(Buffer.from(publicKey, 'hex')).hydrate<IXyoPublicKey>()
      )

      const serializedBoundWitnesses = await Promise.all(blocksByPublicKeySet.boundWitnesses.map(async (block: any) => {
        return {
          humanReadable: block.getReadableValue(),
          bytes: block.serializeHex(),
          publicKeys: block.publicKeys.map((keyset: any) => {
            return {
              array: keyset.keys.map((key: any) => {
                return {
                  value: key.serializeHex()
                }
              })
            }
          }),
          signatures: block.signatures.map((sigSet: any) => {
            return {
              array: sigSet.signatures.map((sig: any) => {
                return {
                  value: sig.serializeHex()
                }
              })
            }
          }),
          heuristics: block.heuristics.map((heuristicSet: any) => {
            return {
              array: heuristicSet.map((heuristic: any) => {
                return {
                  value: heuristic.serializeHex()
                }
              })
            }
          }),
          signedHash: (await this.hashProvider.createHash(block.getSigningData())).serializeHex()
        }
      }))

      return {
        blocks: serializedBoundWitnesses,
        keySet: blocksByPublicKeySet.publicKeys.map((publicKeyItem: any) => {
          return publicKeyItem.serializeHex()
        })
      }

    } catch (e) {
      this.logError(`There was an error getting block-collection from public-key`, e)
      return {
        blocks: [],
        keySet: [publicKey]
      }
    }
  }
}
