
/*
* @Author: XY | The Findables Company <xyo-network>
* @Date:   Thursday, 7th February 2019 12:40:43 pm
* @Email:  developer@xyfindables.com
* @Filename: xyo-block-permission-response-handler.ts

* @Last modified time: Thursday, 7th February 2019 12:41:01 pm
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoOriginChainRepository, IBlockInOriginChainResult, XyoBridgeHashSet, XyoBridgeBlockSet } from '@xyo-network/origin-chain'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoBoundWitness, IXyoPayload, XyoKeySet, XyoFetter, XyoFetterSet, IXyoFetter, XyoWitness, XyoWitnessSet, XyoSignatureSet, XyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener } from '@xyo-network/peer-interaction'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'
import { IXyoP2PService } from '@xyo-network/p2p'
import { XyoBaseHandler } from './xyo-base-handler'
import { CatalogueItem } from '@xyo-network/network'

export class XyoBlockPermissionResponseHandler extends XyoBaseHandler {

  constructor(
    protected readonly serializationService: IXyoSerializationService,
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly payloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly p2pService: IXyoP2PService
  ) {
    super(serializationService)
  }

  public initialize() {
    const topic = 'block-permission:request'
    this.addUnsubscribe(
      topic,
      this.p2pService.subscribe(topic, async (pk, msg) => {
        this.onBlockPermissionRequest(pk, msg)
      })
    )
  }

  private async onBlockPermissionRequest(pk: string, msg: Buffer) {
    const canGetMutex = await this.originChainRepository.canAcquireMutex()
    if (!canGetMutex) return // Dont worry about it for now, may optimize later

    const hash = this.messageParser.tryParseHash(msg, { publicKey: pk })
    if (!hash) {
      return
    }

    const block = await this.originBlockRepository.getOriginBlockByHash(msg)
    if (!block) {
      return
    }

    const belongsToMeResult = await this.originChainRepository.isBlockInOriginChain(block, hash)
    let mutex: any | undefined

     // The block being asked for is one that is in my origin chain
    if (belongsToMeResult.result) {
      mutex = await this.originChainRepository.acquireMutex()
      if (!mutex) return
      return this.doBoundWitness(hash, [block], mutex)
        .then(() => this.originChainRepository.releaseMutex(mutex))
        .catch(() => this.originChainRepository.releaseMutex(mutex))
    }

    // Get all the blocks that have provided attribution for the hash
    const attributionBlocksByHash = await this.originBlockRepository.getBlocksThatProviderAttribution(msg)

    // Try to find the block that contains the attribution that was first shared with me
    const blockInMyChain = await this.tryFindBlockInOriginChain(hash, attributionBlocksByHash)

    // If the block isn't in my chain it cant be signed over
    if (!blockInMyChain || blockInMyChain.originChainResult.indexOfPartyInBlock === undefined) return

    // Try to build proof of attribution
    const supportingDataBlocks = await this.tryResolveProofOfAttribution(
      hash,
      block,
      attributionBlocksByHash,
      { hash: blockInMyChain.hash, indexOfPartyInBlock: blockInMyChain.originChainResult.indexOfPartyInBlock }
    )

    // If no supporting data was returned, could not build attribution
    if (!supportingDataBlocks) {
      return
    }

    mutex = await this.originChainRepository.acquireMutex()
    if (!mutex) return

    // Found Attribution, do just-in-time bound witness
    return this.doBoundWitness(hash, [block, ...supportingDataBlocks], mutex)
      .then(() => this.originChainRepository.releaseMutex(mutex))
      .catch(() => this.originChainRepository.releaseMutex(mutex))
  }

  private async tryFindBlockInOriginChain(hash: IXyoHash, attributionBlocksByHash: {[h: string]: IXyoBoundWitness}) {
    return Object.keys(attributionBlocksByHash)
      .reduce(async (
        promiseChain: Promise<{hash: string, originChainResult: IBlockInOriginChainResult} | undefined>,
        hashKey
      ) => {
        const memo = await promiseChain
        if (memo) return memo
        const bw = attributionBlocksByHash[hashKey]
        const xyoHash = this.serializationService.deserialize(hashKey).hydrate<IXyoHash>()
        const result = await this.originChainRepository.isBlockInOriginChain(bw, xyoHash)

        if (!result.result || result.indexOfPartyInBlock === undefined) return undefined

        const otherBlockParty = bw.parties[(result.indexOfPartyInBlock + 1) % 2] // get the other party
        const bridgeHashSet = otherBlockParty.getHeuristic<XyoBridgeHashSet>(schema.bridgeHashSet.id)
        if (!bridgeHashSet) return undefined
        const containsHashItem = bridgeHashSet.hashSet.some(hashSetItem => hashSetItem.isEqual(hash))
        if (containsHashItem) {
          return { hash: hashKey, originChainResult: result }
        }

        return undefined
      }, Promise.resolve(undefined))
  }

  private async tryResolveProofOfAttribution(
    hash: IXyoHash,
    block: IXyoBoundWitness,
    attributionBlocksByHash: {[h: string]: IXyoBoundWitness},
    blockInMyChain: { hash: string, indexOfPartyInBlock: number}
  ) {
    const blocks = Object.values(attributionBlocksByHash)
    const supportingDataBlocks: IXyoBoundWitness[] = []

    let b = attributionBlocksByHash[blockInMyChain.hash]
    supportingDataBlocks.push(b)

    const indexOfPartyGivingAttribution = (blockInMyChain.indexOfPartyInBlock + 1) % 2
    let pkToLookFor = b.parties[indexOfPartyGivingAttribution].keySet.keys[0]
    let resolvedAttributionTrail = false

    while (true) {
      if (block.parties.some(p => p.keySet.keys[0].isEqual(pkToLookFor))) {
        resolvedAttributionTrail = true
        break
      }

      const precedingBlockWithAttribution = blocks.find((blk) => {
        const indexOfPartyWithPk = blk.parties.findIndex(p => p.keySet.keys[0].isEqual(pkToLookFor))
        if (indexOfPartyWithPk === -1) return false
        const attributingPartyIndex = (indexOfPartyWithPk + 1) % 2
        const bridgeHashSet = blk.parties[attributingPartyIndex]
          .getHeuristic<XyoBridgeHashSet>(schema.bridgeHashSet.id)
        if (bridgeHashSet === undefined) return false
        const containsHashOfInterest = bridgeHashSet.hashSet.some(h => h.isEqual(hash))

        if (!containsHashOfInterest) return false
        pkToLookFor = blk.parties[attributingPartyIndex].keySet.keys[0]
        return true
      })

      if (!precedingBlockWithAttribution) break
      b = precedingBlockWithAttribution
    }

    if (resolvedAttributionTrail) {
      return supportingDataBlocks
    }

    return undefined
  }

  private async doBoundWitness(hash: IXyoHash, blocks: IXyoBoundWitness[], mutex: any) {
    const newBoundWitness = await this.doBoundWitnessWithSupportingData(
      hash,
      blocks,
      [hash],
      await this.originChainRepository.getSigners(),
      await this.payloadProvider.getPayload(this.originChainRepository, CatalogueItem.BOUND_WITNESS)
    )

    if (!newBoundWitness) {
      return
    }

    await this.boundWitnessSuccessListener.onBoundWitnessSuccess(newBoundWitness, mutex, CatalogueItem.BOUND_WITNESS)
    return
  }

  private async doBoundWitnessWithSupportingData(
    forHash: IXyoHash,
    blocks: IXyoBoundWitness[],
    hashes: IXyoHash[],
    signers: IXyoSigner[],
    payload: IXyoPayload
  ): Promise < IXyoBoundWitness | undefined > {
    return new Promise((resolve) => {
      // Send over fetterSet as part 1 of the bound-witness
      const keySet = new XyoKeySet(signers.map(s => s.publicKey))
      const fetter = new XyoFetter(keySet, [...payload.heuristics, new XyoBridgeHashSet(hashes)])
      const fetterSet = new XyoFetterSet([fetter])

      this.p2pService.publish(
        `block-permission:response:${forHash.serializeHex()}`,
        fetterSet.serialize()
      )

      // Register to listen for the response, where the other party sends over a bound-witness fragments
      const boundWitnessFragmentReceivedHandler = this.onBoundWitnessFragmentReceived(
        forHash,
        blocks,
        fetter,
        signers,
        payload,
        resolve
      )

      const topic = `block-permission:response:${forHash.serializeHex()}:bound-witness-fragment`
      this.addUnsubscribe(
        topic,
        this.p2pService.subscribeOnce(
          topic,
          boundWitnessFragmentReceivedHandler
        )
      )
    }) as Promise<IXyoBoundWitness | undefined>
  }

  private onBoundWitnessFragmentReceived(
    forHash: IXyoHash,
    blocks: IXyoBoundWitness[],
    fetter: IXyoFetter,
    signers: IXyoSigner[],
    payload: IXyoPayload,
    resolvePromise: (boundWitness: IXyoBoundWitness | undefined) => void
  ) {
    return async (pk: string, bwFragMsg: Buffer) => {
      const boundWitnessFragment = this.messageParser.tryParseBoundWitnessFragment(bwFragMsg, { publicKey: pk })
      if (!boundWitnessFragment) {
        return resolvePromise(undefined)
      }

      const signingData = Buffer.concat([
        fetter.serialize(),
        boundWitnessFragment.fetterWitnesses[0].serialize()
      ])

      const signatures = await Promise.all(signers.map((signer) => {
        return signer.signData(signingData)
      }))

      const witnessSet = new XyoWitnessSet([
        new XyoWitness(new XyoSignatureSet(signatures), [...payload.metadata, new XyoBridgeBlockSet(blocks)])
      ])

      const nextTopic = `block-permission:response:${forHash.serializeHex()}:witness-set`
      this.p2pService.publish(nextTopic, witnessSet.serialize())
      resolvePromise(new XyoBoundWitness([
        fetter,
        boundWitnessFragment.fetterWitnesses[0],
        boundWitnessFragment.fetterWitnesses[1],
        witnessSet.witnesses[0]
      ]))
    }
  }
}
