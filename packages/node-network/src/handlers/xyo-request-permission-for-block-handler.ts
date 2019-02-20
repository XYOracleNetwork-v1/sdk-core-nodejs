
/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Thursday, 7th February 2019 2:01:18 pm
* @Email:  developer@xyfindables.com
* @Filename: xyo-request-permission-for-block-handler.ts
* @Last modified by: ryanxyo
* @Last modified time: Thursday, 7th February 2019 2:01:42 pm
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import { XyoBaseHandler } from "./xyo-base-handler"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoP2PService } from "@xyo-network/p2p"
import { IXyoHash, IXyoHashProvider } from "@xyo-network/hashing"
import { XyoBridgeBlockSet, IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { IXyoBoundWitnessSuccessListener, IXyoBoundWitnessPayloadProvider } from '@xyo-network/peer-interaction'
import { XyoKeySet, XyoFetter, XyoSignatureSet, XyoWitness, XyoBoundWitnessFragment, XyoBoundWitness, IXyoBoundWitness, IXyoFetterSet, IXyoFetter, IXyoWitness } from "@xyo-network/bound-witness"
import { schema } from '@xyo-network/serialization-schema'
import { IRequestPermissionForBlockResult } from "@xyo-network/attribution-request"
import { XyoError, XyoErrors } from "@xyo-network/errors"

export class XyoRequestPermissionForBlockHandler extends XyoBaseHandler {

  private mutex: any

  constructor(
    protected readonly serializationService: IXyoSerializationService,
    private readonly hashProvider: IXyoHashProvider,
    private readonly p2pService: IXyoP2PService,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly payloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly blockHash: IXyoHash,
    private readonly callback: (publicKey: string, permissionRequest: IRequestPermissionForBlockResult) => void,
  ) {
    super(serializationService)
  }

  public initialize() {
    this.logInfo(`Requesting permission for block with hash ${this.blockHash.serializeHex()}`)
    this.publishRequestPermission()

    const subscribeTopic = `block-permission:response:${this.blockHash.serializeHex()}`

    this.addUnsubscribe(
      subscribeTopic,
      this.p2pService.subscribeOnce(subscribeTopic, this.blockPermissionResponse())
    )
  }

  public async releaseMutex() {
    if (this.mutex !== undefined) {
      await this.originChainRepository.releaseMutex(this.mutex)
      this.mutex = undefined
    }
  }

  private blockPermissionResponse() {
    return async (pk: string, message: Buffer) => {
      this.mutex = await this.tryGetMutex(0)
      if (!this.mutex) return

      const result = await this.getBoundWitnessFragments(pk, message)
      if (!result) return

      const { fetter, fetterSet, witness, boundWitnessFragment } = result

      const boundWitnessFragTopic = `block-permission:response:${this.blockHash.serializeHex()}:bound-witness-fragment`
      this.p2pService.publish(boundWitnessFragTopic, boundWitnessFragment.serialize())
      this.handleWitnessSetMessage(fetterSet, fetter, witness)
    }
  }

  private handleWitnessSetMessage(
    fetterSet: IXyoFetterSet,
    fetter: IXyoFetter,
    witness: IXyoWitness
  ) {
    const nextTopic = `block-permission:response:${this.blockHash.serializeHex()}:witness-set`

    this.addUnsubscribe(nextTopic, this.p2pService.subscribeOnce(nextTopic, async (witnessSetPk, witnessSetMessage) => {
      const witnessSet = this.messageParser.tryParseWitnessSet(witnessSetMessage, { publicKey: witnessSetPk })
      if (!witnessSet) {
        return
      }

      const newBoundWitness = new XyoBoundWitness([
        fetterSet.fetters[0],
        fetter,
        witness,
        witnessSet.witnesses[0]
      ])

      await this.boundWitnessSuccessListener.onBoundWitnessSuccess(newBoundWitness, this.mutex)
      const newBoundWitnessHash = await this.hashProvider.createHash(newBoundWitness.getSigningData())

      // Extract out the bridgeBlockSet
      const blockSet = newBoundWitness.
        parties[0]
        .metadata.find(m => m.schemaObjectId === schema.bridgeBlockSet.id) as XyoBridgeBlockSet

      // Build supporting data
      const supportingData = await blockSet.boundWitnesses
        .reduce(async (promiseChain: Promise<{[h: string]: IXyoBoundWitness}>, bw) => {
          const memo = await promiseChain
          const h = await this.hashProvider.createHash(bw.getSigningData())
          memo[h.serializeHex()] = bw
          return memo
        }, Promise.resolve({}))

      // Callback
      this.callback(witnessSetPk, {
        newBoundWitnessHash,
        supportingData,
        partyIndex: 1,
      })
    }))
  }

  private async getBoundWitnessFragments(publicKey: string, message: Buffer) {
    const fetterSet = this.messageParser.tryParseFetterSet(message, { publicKey })
    if (!fetterSet) {
      return
    }

    const signers = await this.originChainRepository.getSigners()
    const payload = await this.payloadProvider.getPayload(this.originChainRepository)

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
    const boundWitnessFragment = new XyoBoundWitnessFragment([fetter, witness])

    return {
      boundWitnessFragment,
      witness,
      signatureSet,
      signatures,
      fetter,
      fetterSet,
      keySet,
      payload
    }
  }

  private publishRequestPermission() {
    const requestTopic = 'block-permission:request'
    this.p2pService.publish(requestTopic, this.blockHash.serialize())
  }

  private async tryGetMutex(currentTry: number) {
    const mutex = await this.originChainRepository.acquireMutex()
    if (mutex) return mutex
    if (currentTry === 3) throw new XyoError(`Could not acquire mutex for origin chain`, XyoErrors.CRITICAL)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.tryGetMutex(currentTry + 1).then(resolve).catch(reject)
      }, 100 * (currentTry + 1)) // linear backoff
    })
  }
}
