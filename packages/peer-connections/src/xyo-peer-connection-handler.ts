/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 11:18:23 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-handler.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 20th November 2018 11:24:59 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from '@xyo-network/network'
import { IXyoPeerConnectionHandler, IXyoCatalogueResolver, IXyoCategoryRouter } from './@types'
import { XyoBase } from '@xyo-network/base'

export class XyoPeerConnectionHandler extends XyoBase implements IXyoPeerConnectionHandler {

  constructor(private readonly router: IXyoCategoryRouter, private readonly categoryResolver: IXyoCatalogueResolver) {
    super()
  }

  public async handlePeerConnection(networkPipe: IXyoNetworkPipe) {
    if (!networkPipe.otherCatalogue || networkPipe.otherCatalogue.length < 1) {
      this.logInfo(`No catalogue items in other catalogue, closing connection`)
      await networkPipe.close()
      return
    }

    const category = this.categoryResolver.resolveCategory(networkPipe.otherCatalogue)

    if (!category) {
      this.logInfo(`Unable to resolve a category ${category}, closing connection`)
      await networkPipe.close()
      return
    }

    const handler = this.router.getHandler(category)
    if (!handler) {
      this.logInfo(`Could not find handler for category ${category}, closing connection`)
      await networkPipe.close()
      return
    }

    await handler.handle(networkPipe)
  }
}
