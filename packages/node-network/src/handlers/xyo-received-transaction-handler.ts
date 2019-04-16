import { XyoBaseHandler } from "./xyo-base-handler"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoP2PService } from "@xyo-network/p2p"
import { IXyoTransactionRepository, IXyoTransaction } from "@xyo-network/transaction-pool"

/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Tuesday, 12th February 2019 9:21:59 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-received-transaction-handler.ts
 
 * @Last modified time: Monday, 11th March 2019 3:49:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

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
