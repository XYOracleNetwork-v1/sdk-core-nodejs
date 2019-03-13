/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 5:30:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 12th March 2019 3:48:02 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNodeNetwork, IXyoComponentFeatureResponse, IBlockWitnessRequestDTO } from "./@types"
import { IXyoP2PService } from "@xyo-network/p2p"
import { unsubscribeFn, BN } from "@xyo-network/utils"
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

import { IXyoTransaction, IXyoTransactionRepository } from '@xyo-network/transaction-pool'
import { XyoReceivedTransactionHandler } from "./handlers/xyo-received-transaction-handler"
import { XyoWitnessRequestHandler } from "./handlers/xyo-witness-requester-handler"
import { IConsensusProvider } from "@xyo-network/consensus"
import { XyoError } from "@xyo-network/errors"

export class XyoNodeNetwork extends XyoBase implements IXyoNodeNetwork {

  private unsubscribeComponentFeature: unsubscribeFn | undefined
  private messageParser: XyoMessageParser
  private readonly blockWitnessValidator: IBlockWitnessValidator | undefined
  private readonly transactionsRepository: IXyoTransactionRepository | undefined
  private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener | undefined
  private readonly payloadProvider: IXyoBoundWitnessPayloadProvider | undefined
  private readonly originChainRepository: IXyoOriginChainRepository | undefined
  private readonly originBlockRepository: IXyoOriginBlockRepository | undefined
  private readonly hashProvider: IXyoHashProvider | undefined

  constructor (
    private readonly p2pService: IXyoP2PService,
    private readonly serializationService: IXyoSerializationService,
    readonly optionalDeps: IOptionalDeps
  ) {
    super()
    this.messageParser = new XyoMessageParser(serializationService)
    this.blockWitnessValidator = optionalDeps.blockWitnessValidator
    this.transactionsRepository = optionalDeps.transactionsRepository
    this.boundWitnessSuccessListener = optionalDeps.boundWitnessSuccessListener
    this.payloadProvider = optionalDeps.payloadProvider
    this.originChainRepository = optionalDeps.originChainRepository
    this.originBlockRepository = optionalDeps.originBlockRepository
    this.hashProvider = optionalDeps.hashProvider
  }

  public serviceBlockPermissionRequests(): unsubscribeFn {
    if (
      !this.boundWitnessSuccessListener ||
      !this.payloadProvider ||
      !this.originChainRepository ||
      !this.originBlockRepository
    ) {
      throw new XyoError(`Insufficient dependencies`)
    }

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
    if (!this.transactionsRepository) {
      throw new XyoError(`Insufficient dependencies`)
    }

    const handler = new XyoReceivedTransactionHandler(
      this.serializationService,
      this.p2pService,
      this.transactionsRepository
    )

    handler.initialize()
    return handler.unsubscribeAll.bind(handler)
  }

  public async shareTransaction(id: string, transaction: IXyoTransaction<any>): Promise<void> {
    this.p2pService.publish('transaction:share', Buffer.from(JSON.stringify({
      id,
      transaction
    })))
  }

  public requestSignaturesForBlockCandidate(
    candidate: IBlockWitnessRequestDTO,
    callback: (publicKey: string, signatureComponents: { r: string; s: string; v: number; }) => void
  ): unsubscribeFn {
    this.p2pService.publish('block-witness:request', Buffer.from(JSON.stringify(candidate)))

    return this.p2pService.subscribe(`block-witness:request:${candidate.blockHash}`, (pk, message) => {
      const strMsg = message.toString()
      const msgPayload = JSON.parse(strMsg) as {
        publicKey: string,
        signatureComponents: {r: string, s: string, v: number}
      }

      callback(msgPayload.publicKey, {
        r: msgPayload.signatureComponents.r,
        s: msgPayload.signatureComponents.s,
        v: msgPayload.signatureComponents.v,
      })
    })
  }

  public listenForBlockWitnessRequests(consensusProvider: IConsensusProvider): unsubscribeFn {
    if (!this.blockWitnessValidator) {
      throw new XyoError(`Insufficient dependencies`)
    }

    const handler = new XyoWitnessRequestHandler(
      this.serializationService,
      this.p2pService,
      consensusProvider,
      this.blockWitnessValidator
    )

    handler.initialize()
    return handler.unsubscribeAll.bind(handler)
  }

  // tslint:disable-next-line:prefer-array-literal
  public getTransactions(): Promise<Array<IXyoTransaction<any>>> {
    throw new Error("Method not implemented.")
  }

  public requestFeatures(callback: (publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void)
  : unsubscribeFn {
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
    if (
      !this.hashProvider ||
      !this.originChainRepository ||
      !this.payloadProvider ||
      !this.boundWitnessSuccessListener
    ) {
      throw new XyoError(`Insufficient dependencies`)
    }

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

export interface IBlockWitnessValidator {
  validate(
    blockHash: string,
    agreedStakeBlockHeight: BN,
    previousBlockHash: string,
    supportingDataHash: string,
    requests: string[],
    responses: Buffer
  ): Promise<boolean>
}

export interface IOptionalDeps {
  blockWitnessValidator?: IBlockWitnessValidator
  transactionsRepository?: IXyoTransactionRepository
  boundWitnessSuccessListener?: IXyoBoundWitnessSuccessListener
  payloadProvider?: IXyoBoundWitnessPayloadProvider
  originChainRepository?: IXyoOriginChainRepository
  originBlockRepository?: IXyoOriginBlockRepository
  hashProvider?: IXyoHashProvider
}
