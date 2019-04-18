/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 21st December 2018 11:33:04 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-question-service.ts

 * @Last modified time: Friday, 8th February 2019 12:39:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHasIntersectedQuestion, IXyoQuestionService, IXyoBlockTransfer, IProofOfIntersection } from './@types'
import { XyoBase } from '@xyo-network/base'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoOriginChainRepository, XyoBridgeHashSet } from '@xyo-network/origin-chain'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoPublicKey } from '@xyo-network/signing'
import { IBlockPermissionRequestResolver } from '@xyo-network/attribution-request'
import { IXyoArchivistNetwork } from '@xyo-network/sdk-archivist-nodejs'

export class XyoQuestionService extends XyoBase implements IXyoQuestionService {

  constructor (
    private readonly originBlocksRepository: IXyoOriginBlockRepository,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly archivistNetwork: IXyoArchivistNetwork,
    private readonly blockPermissionRequestResolver: IBlockPermissionRequestResolver
  ) {
    super()
  }

  public async buildProofOfIntersection(
    question: IXyoHasIntersectedQuestion,
    forHashes: IXyoHash[]
  ): Promise<IProofOfIntersection | undefined> {
    if (forHashes.length === 0) return undefined

    // We will reference this a number of times, basic DRY principles apply
    const continueFn = async () => forHashes.length > 1 ?
      this.buildProofOfIntersection(question, forHashes.slice(1)) :
      undefined

    const promiseChain: Promise<IProofOfIntersection | undefined> = Promise.resolve(undefined)
    const hash = forHashes[0]
    const result = await promiseChain
    if (result !== undefined) return result

    const block = await this.resolveBlockByHash(hash)
    if (!block) {
      return continueFn()
    }

    const isPartOfOriginChainResult = await this.originChainRepository.isBlockInOriginChain(block, hash)

    // The block in question is not part of your origin-chain
    if (!isPartOfOriginChainResult.result || isPartOfOriginChainResult.indexOfPartyInBlock === undefined) {
      return this.resolveProofForOutOfOriginChainBlock(
        block,
        hash,
        question,
        continueFn
      )
    }

    const myParty = block.parties[isPartOfOriginChainResult.indexOfPartyInBlock]

    // Assumes only one key in partyOne and partyTwo values
    const matchedMyPublicKeyInPartyOneInQuestion = myParty.keySet.keys.some(
      k => k.serializeHex() === question.partyOne[0]
    )

    const matchedMyPublicKeyInPartyTwoInQuestion = myParty.keySet.keys.some(
      k => k.serializeHex() === question.partyTwo[0]
    )

    // First case: Doesn't match either means rolling public key
    if (!matchedMyPublicKeyInPartyOneInQuestion && !matchedMyPublicKeyInPartyTwoInQuestion) {
      // At some point, we will support rolling public keys more thoroughly, for now lets skip over
      return continueFn()
    }

    // We dont really know how to handle this scenario where both pks are the same
    if (matchedMyPublicKeyInPartyOneInQuestion && matchedMyPublicKeyInPartyTwoInQuestion) {
      return continueFn()
    }

    // matchedPublicKeyInPartyOneInQuestion XOR matchedPublicKeyInPartyTwoInQuestion must be true
    const otherParty = block.parties[(isPartOfOriginChainResult.indexOfPartyInBlock + 1) % 2]

    const matchedOtherPublicKeyInPartyQuestion = otherParty.keySet.keys.some((k) => {
      return k.serializeHex() === (matchedMyPublicKeyInPartyOneInQuestion ? question.partyTwo[0] : question.partyOne[0])
    })

    if (!matchedOtherPublicKeyInPartyQuestion) {
      return continueFn() // Rolling public keys
    }

    // By virtue of getting here, this is the right block!
    return {
      question,
      answer: {
        hash: hash.serializeHex(),
        proofOfIdentities: [[], []] as string[][],
        transfers: [] as IXyoBlockTransfer[]
      }
    }
  }

  public async resolveProofForOutOfOriginChainBlock(
    block: IXyoBoundWitness,
    hash: IXyoHash,
    question: IXyoHasIntersectedQuestion,
    continueFn: () => Promise<IProofOfIntersection | undefined>
  ): Promise<IProofOfIntersection | undefined> {
    this.logInfo(`Attempting to resolve proof for out of origin-chain block ${hash.serializeHex()}`)

    const result = await this.blockPermissionRequestResolver.requestPermissionForBlock(hash, 10000)
    if (!result) {
      this.logInfo(
        `Unable to resolve proof for out of origin-chain block ${hash.serializeHex()}, no attribution request responses`
      )
      return continueFn()
    }
    let publicKeysToFind = block.publicKeys.reduce((acc, pks) => {
      acc.push(...pks.keys)
      return acc
    }, [] as IXyoPublicKey[])
    const transfers: IXyoBlockTransfer[] = []

    // Loops through attribution data provided and attempt to build attribution proof ending with
    // the new diviner bound-witness

    let succeededInProducingProof = false
    const hashToFind = hash.serializeHex()
    let previousBridgeBlockHash = hashToFind
    const visitedNodes: {[s: string]: boolean} = {
      [hashToFind]: true
    }

    while (true) {
      // Make sure the hash we're trying to find is in the supporting data
      const bw = result.supportingData[hashToFind]
      if (!bw) {
        this.logInfo(
          `Failed in building proof for out of origin-chain block ${hash.serializeHex()},` +
          `insufficient supporting data for hash ${hashToFind}`
        )

        succeededInProducingProof = false
        break
      }

      let partyIndex = -1 // default value for not found in findIndex call below

      // Attempt to find a block that bridged `hashToFind`
      const bridgeBlockHash = Object.keys(result.supportingData).find((bwHash) => {
        if (visitedNodes[bwHash]) return false // prevent circular traversals

        // Get the index of the party of the bound-witness with the bridge hash
        partyIndex = result.supportingData[bwHash].heuristics.findIndex((hSet, index) => {

          // Find the bridge block with the hash of interest in the bridge-hash-set
          const bridgeHashSetContainsHash = hSet.some((h) => {
            return h.schemaObjectId === XyoBridgeHashSet.deserializer.schemaObjectId &&
              ((h as XyoBridgeHashSet).getData() as IXyoHash[])
              .some(bridgeHash => bridgeHash.serializeHex() === hashToFind)
          })

          // Make sure there public-key continuity otherwise bridge block is invalid
          const hasPublicKeyContinuity = result.supportingData[bwHash].parties[index].keySet.keys.some((k) => {
            const foundPk = publicKeysToFind.find(pk => pk.isEqual(k))
            return Boolean(foundPk)
          })

          // true iff block received bridged hash with public key continuity
          return bridgeHashSetContainsHash && hasPublicKeyContinuity
        })

        return partyIndex !== -1
      })

      // We can not build a proof with the current set of data
      if (!bridgeBlockHash) {
        this.logInfo(
          `Failed in building proof for out of origin-chain block ${hash.serializeHex()}, ` +
          `could not find bridge block for ${hashToFind}`
        )
        succeededInProducingProof = false
        break
      }

      visitedNodes[bridgeBlockHash] = true

      this.logInfo(`Found bridge block hash for ${previousBridgeBlockHash} with bridge block ${bridgeBlockHash}`)
      previousBridgeBlockHash = bridgeBlockHash

      // add transfer to proof
      transfers.push({
        hash: bridgeBlockHash,
        proofOfIdentityFrom: []
      })

      if (bridgeBlockHash === result.newBoundWitnessHash.serializeHex()) {
        succeededInProducingProof = true
        break
      }

      // Switch public-keys-to-find to the party who received the bridge block
      publicKeysToFind = result.supportingData[bridgeBlockHash].parties[(partyIndex + 1 % 2)].keySet.keys
    }

    if (!succeededInProducingProof) return continueFn()

    return {
      question,
      answer: {
        transfers,
        hash: hash.serializeHex(),
        proofOfIdentities: [[], []] as string[][],
      }
    }
  }

  public async getIntersections(question: IXyoHasIntersectedQuestion): Promise<IXyoHash[]> {
    return this.archivistNetwork.getIntersections(
      question.partyOne,
      question.partyTwo,
      question.markers,
      question.direction
    )
  }

  private async getBlockFromArchivistNetwork(hash: IXyoHash): Promise<IXyoBoundWitness | undefined> {
    return undefined // TODO
  }

  private async resolveBlockByHash(hash: IXyoHash) {
    const block = await this.originBlocksRepository.getOriginBlockByHash(hash.serialize())
    if (block) return block
    return this.getBlockFromArchivistNetwork(hash)
  }
}
