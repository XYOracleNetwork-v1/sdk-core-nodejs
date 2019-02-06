/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 5:30:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th February 2019 1:44:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNodeNetwork, IXyoComponentFeatureResponse } from "./@types"
import { unsubscribeFn, IXyoP2PService } from "@xyo-network/p2p"
import { IRequestPermissionForBlockResult } from "@xyo-network/attribution-request"
import { XyoBase } from "@xyo-network/base"
import { IXyoHash, IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoBoundWitness, IXyoPayload, XyoBoundWitnessFragment, XyoFetter, XyoKeySet, XyoSignatureSet, XyoWitness, XyoBoundWitness, XyoFetterSet, XyoWitnessSet } from "@xyo-network/bound-witness"
import { tryParseComponentFeature, tryParseFetterSet, tryParseWitnessSet, tryParseHash, tryParseBoundWitnessFragment } from "./parsers"
import { IXyoSigner } from "@xyo-network/signing"
import { schema } from '@xyo-network/serialization-schema'
import { XyoBridgeBlockSet, IXyoOriginChainRepository, XyoBridgeHashSet, IBlockInOriginChainResult } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"

export class XyoNodeNetwork extends XyoBase implements IXyoNodeNetwork {

  private unsubscribeComponentFeature: unsubscribeFn | undefined

  constructor (
    private readonly p2pService: IXyoP2PService,
    private readonly serializationService: IXyoSerializationService,
    private readonly hashProvider: IXyoHashProvider
  ) {
    super()
  }

  public serviceBlockPermissionRequests(
    originBlockRepository: IXyoOriginBlockRepository,
    originChainRepository: IXyoOriginChainRepository,
    signersProvider: () => Promise<IXyoSigner[]>,
    payloadProvider: () => Promise<IXyoPayload>,
  ): unsubscribeFn {
    let unsubscribes: unsubscribeFn[] = []
    unsubscribes.push(this.p2pService.subscribe(
      'block-permission:request', async (pk, msg) => {
        const hash = tryParseHash(msg, { logger: XyoBase.logger, publicKey: pk })
        if (!hash) {
          return
        }

        const block = await originBlockRepository.getOriginBlockByHash(msg)
        if (!block) {
          return
        }

        const belongsToMeResult = await originChainRepository.isBlockInOriginChain(block, hash)
        if (belongsToMeResult.result) { // The block being asked for is one that is in my origin chain
          return this.doBoundWitnessWithSupportingData(
            hash,
            [block],
            [hash],
            await signersProvider(),
            await payloadProvider()
          )
        }

        const attributionBlocksByHash = await originBlockRepository.getBlocksThatProviderAttribution(msg)

        // Try to find the block that contains the attribution that was first shared with me
        const blockInMyChain = await Object.keys(attributionBlocksByHash)
          .reduce(async (
            promiseChain: Promise<{hash: string, originChainResult: IBlockInOriginChainResult} | undefined>,
            hashKey
          ) => {
            const memo = await promiseChain
            if (memo) return memo
            const bw = attributionBlocksByHash[hashKey]
            const xyoHash = this.serializationService.deserialize(hashKey).hydrate<IXyoHash>()
            const result = await originChainRepository.isBlockInOriginChain(bw, xyoHash)

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

        if (!blockInMyChain) return
      })
    )

    return () => {
      unsubscribes.forEach(u => u())
      unsubscribes = []
    }
  }

  public setFeatures(features: IXyoComponentFeatureResponse): void {
    const featureJSON = Buffer.from(JSON.stringify(features, null, 2))

    if (this.unsubscribeComponentFeature) {
      this.unsubscribeComponentFeature()
    }

    this.unsubscribeComponentFeature = this.p2pService.subscribe('component-feature:request', (senderPublicKey) => {
      this.logInfo(`Received component-feature:request from ${senderPublicKey}`)
      this.p2pService.publishMessageToPeer('component-feature:response',
        featureJSON,
        senderPublicKey
      )
    })
  }

  public requestFeatures(
    callback: (publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void)
  : unsubscribeFn {
    this.logInfo(`Requesting features from network`)
    this.p2pService.publish('component-feature:request', Buffer.alloc(0))
    return this.p2pService.subscribe('component-feature:response', (pk, message) => {
      const parseFeatureResponse = tryParseComponentFeature(message, { logger: XyoBase.logger, publicKey: pk })
      if (!parseFeatureResponse) {
        return
      }

      this.logInfo(`Received component-feature:response from ${pk} and payload:\n${message.toString()}`)
      callback(pk, parseFeatureResponse)
    })
  }

  public requestPermissionForBlock(
    blockHash: IXyoHash,
    signers: IXyoSigner[],
    payload: IXyoPayload,
    callback: (publicKey: string, permissionRequest: IRequestPermissionForBlockResult) => void
  ): unsubscribeFn {
    this.logInfo(`Requesting permission for block with hash ${blockHash.serializeHex()}`)
    this.p2pService.publish('block-permission:request', blockHash.serialize())
    let unsubscribes: unsubscribeFn[] = []

    unsubscribes.push(this.p2pService.subscribe(
      `block-permission:response:${blockHash.serializeHex()}`, async (pk, message) => {
        if (unsubscribes.length === 0) {
          return
        }

        const fetterSet = tryParseFetterSet(message, { logger: XyoBase.logger, publicKey: pk })
        if (!fetterSet) {
          return
        }

        unsubscribes[0]()
        unsubscribes.splice(0, 1)

        const keySet = new XyoKeySet(signers.map(s => s.publicKey))
        const fetter = new XyoFetter(keySet, payload.heuristics)

        const signingData = Buffer.concat([
          fetterSet.fetters[0].serialize(),
          fetter.serialize()
        ])

        const signatures = await Promise.all(signers.map((signer) => {
          return signer.signData(signingData)
        }))

        const signatureSet = new XyoSignatureSet(signatures)
        const witness = new XyoWitness(signatureSet, payload.metadata)
        const bwFrag = new XyoBoundWitnessFragment([fetter, witness])
        const newTopic = `block-permission:response:${blockHash.serializeHex()}:bound-witness-fragment`
        this.p2pService.publish(newTopic, bwFrag.serialize())
        const nextTopic = `block-permission:response:${blockHash.serializeHex()}:witness-set`
        unsubscribes.push(this.p2pService.subscribe(nextTopic, async (sigsPk, sigsMessage) => {
          unsubscribes[0]()
          unsubscribes.splice(0, 1)

          const witnessSet = tryParseWitnessSet(sigsMessage, { logger: XyoBase.logger, publicKey: sigsPk })
          if (!witnessSet) {
            return
          }

          const newBoundWitness = new XyoBoundWitness([
            fetterSet.fetters[0],
            fetter,
            witness,
            witnessSet.witnesses[0]
          ])

          const newBoundWitnessHash = await this.hashProvider.createHash(newBoundWitness.getSigningData())
          const bridgeBlockSet = newBoundWitness.parties[1]
            .metadata.find(m => m.schemaObjectId === schema.bridgeBlockSet.id)
          const blockSet = bridgeBlockSet as XyoBridgeBlockSet
          const supportingData = await blockSet.boundWitnesses
            .reduce(async (promiseChain: Promise<{[h: string]: IXyoBoundWitness}>, bw) => {
              const memo = await promiseChain
              const h = await this.hashProvider.createHash(bw.getSigningData())
              memo[h.serializeHex()] = bw
              return memo
            }, Promise.resolve({}))

          callback(sigsPk, {
            newBoundWitnessHash,
            supportingData,
            partyIndex: 1,
          })

        }))
      }
    ))

    return () => {
      unsubscribes.forEach(u => u())
      unsubscribes = []
    }
  }

  private async doBoundWitnessWithSupportingData(
    forHash: IXyoHash,
    blocks: IXyoBoundWitness[],
    hashes: IXyoHash[],
    signers: IXyoSigner[],
    payload: IXyoPayload
  ): Promise<IXyoBoundWitness | undefined> {
    return new Promise((resolve, reject) => {
      const keySet = new XyoKeySet(signers.map(s => s.publicKey))
      const fetter = new XyoFetter(keySet, [...payload.heuristics, new XyoBridgeHashSet(hashes)])
      const fetterSet = new XyoFetterSet([fetter])
      this.p2pService.publish(`block-permission:response:${forHash.serializeHex()}`, fetterSet.serialize())
      const newTopic = `block-permission:response:${forHash.serializeHex()}:bound-witness-fragment`
      this.p2pService.subscribe(newTopic, async (pk, bwFragMsg) => {
        const boundWitnessFragment = tryParseBoundWitnessFragment(bwFragMsg, { logger: XyoBase.logger, publicKey: pk })
        if (!boundWitnessFragment) {
          return resolve(undefined)
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
        resolve(new XyoBoundWitness([
          fetter,
          boundWitnessFragment.fetterWitnesses[0],
          boundWitnessFragment.fetterWitnesses[1],
          witnessSet.witnesses[0]
        ]))
      })
    }) as Promise<IXyoBoundWitness | undefined>
  }
}

interface IBlockPermissionResponse {
  newBoundWitnessHash: string,
  partyIndex: number,
  supportingData: {[hash: string]: string}
}

// try {
//   const jsonMessage = JSON.parse(message.toString()) as IBlockPermissionResponse
//   const res: IRequestPermissionForBlockResult = {
//     newBoundWitnessHash: this.serializationService
//       .deserialize(jsonMessage.newBoundWitnessHash).hydrate(),
//     partyIndex: jsonMessage.partyIndex,
//     supportingData: Object.keys(jsonMessage.supportingData)
//       .reduce((obj: {[hash: string]: IXyoBoundWitness}, k) => {
//         obj[k] = this.serializationService.deserialize(jsonMessage.supportingData[k]).hydrate()
//         return obj
//       }, {})
//   }

//   callback(pk, res)
// } catch (e) {
//   this.logError(`There was a non-critical error parsing a message while requesting block for ${blockHash} ` +
//     `public key ${pk} and message ${message}` , e)
//   return
// }
