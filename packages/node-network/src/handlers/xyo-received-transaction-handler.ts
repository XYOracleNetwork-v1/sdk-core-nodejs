/*
 * File: xyo-received-transaction-handler.ts
 * Project: @xyo-network/node-network
 * File Created: Friday, 19th April 2019 11:18:35 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 19th April 2019 11:46:48 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoBaseHandler } from './xyo-base-handler'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoP2PService } from '@xyo-network/p2p'
import { IXyoTransactionRepository, IXyoTransaction } from '@xyo-network/transaction-pool'

export class XyoReceivedTransactionHandler extends XyoBaseHandler {

  constructor (
    protected readonly serializationService: IXyoSerializationService,
    private readonly p2pService: IXyoP2PService,
    private readonly transactionsRepository: IXyoTransactionRepository
  ) {
    super(serializationService)
  }

  public initialize(): void {
    const topic = 'transaction:share'
    this.addUnsubscribe(topic,
                        this.p2pService.subscribe(topic, async (pk, message) => {
                          const jsonMsg = JSON.parse(message.toString()) as {id: string, transaction: IXyoTransaction<any>}
                          const alreadyExists = await this.transactionsRepository.contains(jsonMsg.id)
                          if (alreadyExists) return

                          try {
                            await this.transactionsRepository.add(jsonMsg.id, jsonMsg.transaction)
                          } catch (err) {
                            this.logError(`There was an issue parsing transaction from public key ${pk}`)
                            // non-critical error, so swallow it
                          }
                        })
    )
  }
}
