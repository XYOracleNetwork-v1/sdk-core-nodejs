/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 5:30:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 12th February 2019 10:43:37 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNodeNetwork, IXyoComponentFeatureResponse } from "./@types"
import { IXyoP2PService } from "@xyo-network/p2p"
import { unsubscribeFn, IXyoRepository } from "@xyo-network/utils"
import { IRequestPermissionForBlockResult } from "@xyo-network/attribution-request"
import { XyoBase } from "@xyo-network/base"
import { IXyoHash, IXyoHashProvider } from "@xyo-network/hashing"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { XyoMessageParser } from "./parsers"
import { IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { IXyoOriginBlockRepository } from "@xyo-network/origin-block-repository"
import { IXyoBoundWitnessSuccessListener, IXyoBoundWitnessPayloadProvider } from '@xyo-network/peer-interaction'
import { XyoBlockPermissionResponseHandler } from "./handlers/xyo-block-permission-response-handler"
import { XyoRequestPermissionForBlockHandler } from "./handlers/xyo-request-permission-for-block-handler"

import { IXyoTransactionRepository, IXyoTransaction } from '@xyo-network/transaction-pool'
import { XyoReceivedTransactionHandler } from "./handlers/xyo-received-transaction-handler"

export class XyoNodeNetwork extends XyoBase implements IXyoNodeNetwork, IXyoTransactionRepository {

  private unsubscribeComponentFeature: unsubscribeFn | undefined
  private messageParser: XyoMessageParser

  constructor (
    private readonly p2pService: IXyoP2PService,
    private readonly serializationService: IXyoSerializationService,
    private readonly hashProvider: IXyoHashProvider,
    private readonly originBlockRepository: IXyoOriginBlockRepository,
    private readonly originChainRepository: IXyoOriginChainRepository,
    private readonly payloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly transactionsRepository: IXyoRepository<IXyoHash, IXyoTransaction<any>>
  ) {
    super()
    this.messageParser = new XyoMessageParser(serializationService)
  }

  public serviceBlockPermissionRequests(): unsubscribeFn {
    const handler = new XyoBlockPermissionResponseHandler(
      this.serializationService,
      this.originBlockRepository,
      this.originChainRepository,
      this.payloadProvider,
      this.boundWitnessSuccessListener,
      this.p2pService
    )

    handler.initialize()
    return handler.unsubscribeAll.bind(handler)
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

  public listenForTransactions(): unsubscribeFn {
    const handler = new XyoReceivedTransactionHandler(
      this.serializationService,
      this.p2pService,
      this.hashProvider,
      this.transactionsRepository
    )

    handler.initialize()
    return handler.unsubscribeAll.bind(handler)
  }

  public async shareTransaction(transaction: IXyoTransaction<any>): Promise<void> {
    this.p2pService.publish('transaction:share', Buffer.from(JSON.stringify(transaction)))
  }

  // tslint:disable-next-line:prefer-array-literal
  public getTransactions(): Promise<Array<IXyoTransaction<any>>> {
    throw new Error("Method not implemented.")
  }

  public requestFeatures(callback: (publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void)
  : unsubscribeFn {
    this.logInfo(`Requesting features from network`)
    this.p2pService.publish('component-feature:request', Buffer.alloc(0))

    return this.p2pService.subscribe('component-feature:response', (pk, message) => {
      const parseFeatureResponse = this.messageParser.tryParseComponentFeature(message, { publicKey: pk })
      if (!parseFeatureResponse) {
        return
      }

      this.logInfo(`Received component-feature:response from ${pk} and payload:\n${message.toString()}`)
      callback(pk, parseFeatureResponse)
    })
  }

  public requestPermissionForBlock(
    blockHash: IXyoHash,
    callback: (publicKey: string, permissionRequest: IRequestPermissionForBlockResult) => void
  ): unsubscribeFn {

    const req = new XyoRequestPermissionForBlockHandler(
      this.serializationService,
      this.hashProvider,
      this.p2pService,
      this.originChainRepository,
      this.payloadProvider,
      this.boundWitnessSuccessListener,
      blockHash,
      callback
    )

    req.initialize()
    return req.unsubscribeAll.bind(req)
  }
}
