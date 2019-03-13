/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 28th February 2019 10:14:01 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 7th March 2019 12:01:30 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoDaemon, unsubscribeFn, BN } from '@xyo-network/utils'
import { IXyoNodeNetwork } from '@xyo-network/node-network'
import { IConsensusProvider } from '@xyo-network/consensus'

export { XyoBlockWitnessValidator } from './xyo-block-witness-validator'
export class XyoBlockWitness extends XyoDaemon {
  private unsubscribe: unsubscribeFn | undefined

  constructor(
    private readonly nodeNetwork: IXyoNodeNetwork,
    private readonly consensusProvider: IConsensusProvider
  ) {
    super()
  }

  public run(): void {
    try {
      this.unsubscribe = this.nodeNetwork.listenForBlockWitnessRequests(this.consensusProvider)
    } catch (e) {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = undefined
      }
      this.logError(`There as an uncaught error in the block witness daemon`, e)
      throw e
    }
  }

  public async stop() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
  }
}
