import { XyoBaseHandler } from "./xyo-base-handler"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoP2PService } from "@xyo-network/p2p"
import { IXyoTransaction } from "@xyo-network/transaction-pool"
import { IXyoRepository } from "@xyo-network/utils"
import { IXyoHash, IXyoHashProvider } from "@xyo-network/hashing"

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 12th February 2019 9:21:59 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-received-transaction-handler.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 12th February 2019 10:20:56 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export class XyoReceivedTransactionHandler extends XyoBaseHandler {

  constructor (
    protected readonly serializationService: IXyoSerializationService,
    private readonly p2pService: IXyoP2PService,
    private readonly hashProvider: IXyoHashProvider,
    private readonly transactionsRepository: IXyoRepository<IXyoHash, IXyoTransaction<any>>
  ) {
    super(serializationService)
  }

  public initialize(): void {
    const topic = 'transaction:share'
    this.addUnsubscribe(topic,
      this.p2pService.subscribe(topic, async (pk, message) => {
        const hash = await this.hashProvider.createHash(message)
        const alreadyExists = await this.transactionsRepository.contains(hash)
        if (alreadyExists) return
        try {
          const transaction = JSON.parse(Buffer.toString())
          await this.transactionsRepository.add(hash, transaction)
        } catch (err) {
          this.logError(`There was an issue parsing transaction from public key ${pk}`)
          // non-critical error, so swallow it
        }
      })
    )
  }
}
