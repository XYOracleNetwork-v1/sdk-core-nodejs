/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 5:30:48 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 1:13:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNodeNetwork, IXyoComponentFeatureResponse } from "./@types"
import { unsubscribeFn, IXyoP2PService } from "@xyo-network/p2p"
import { XyoBase } from "@xyo-network/base"

export class XyoNodeNetwork extends XyoBase implements IXyoNodeNetwork {
  private unsubscribeComponentFeature: unsubscribeFn | undefined

  constructor (private readonly p2pService: IXyoP2PService) {
    super()
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

  public requestFeatures(callback: (publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void
  ): unsubscribeFn {
    this.logInfo(`Requesting features from network`)
    this.p2pService.publish('component-feature:request', Buffer.alloc(0))
    return this.p2pService.subscribe('component-feature:response', (pk, message) => {
      const parseFeatureResponse = JSON.parse(message.toString()) as IXyoComponentFeatureResponse
      this.logInfo(`Received component-feature:response from ${pk} and payload:\n${message.toString()}`)
      callback(pk, parseFeatureResponse)
    })
  }

}
