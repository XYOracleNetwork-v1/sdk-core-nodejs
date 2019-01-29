/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 5:30:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 9:57:32 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNodeNetwork, IXyoComponentFeatureResponse } from "./@types"
import { unsubscribeFn, IXyoP2PService } from "@xyo-network/p2p"

export class XyoNodeNetwork implements IXyoNodeNetwork {
  private unsubscribeComponentFeature: unsubscribeFn | undefined

  constructor (private readonly p2pService: IXyoP2PService) {}

  public setFeatures(features: IXyoComponentFeatureResponse): void {
    const featureJSON = Buffer.from(JSON.stringify(features))

    if (this.unsubscribeComponentFeature) {
      this.unsubscribeComponentFeature()
    }

    this.unsubscribeComponentFeature = this.p2pService.subscribe('component-feature:request', (senderPublicKey) => {
      this.p2pService.publishMessageToPeer('component-feature:response',
        featureJSON,
        senderPublicKey
      )
    })
  }

  public requestFeatures(callback: (publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void
  ): unsubscribeFn {

    this.p2pService.publish('component-feature:request', Buffer.alloc(0))
    return this.p2pService.subscribe('component-feature:response', (pk, message) => {
      const parseFeatureResponse = message.toString() as IXyoComponentFeatureResponse
      callback(pk, parseFeatureResponse)
    })
  }

}
