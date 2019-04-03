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

import { IXyoNetworkPipe, CatalogueItem } from '@xyo-network/network'
import { IXyoPeerConnectionHandler, IXyoCatalogueResolver, IXyoCategoryRouter } from './@types'
import { XyoBase } from '@xyo-network/base'

export class XyoPeerConnectionHandler extends XyoBase implements IXyoPeerConnectionHandler {

  constructor(private readonly router: IXyoCategoryRouter, private readonly categoryResolver: IXyoCatalogueResolver) {
    super()
  }

  // this is when a SERVER chooses the flag for the client
  public async handlePeerConnection(
    networkPipe: IXyoNetworkPipe,
    choice: CatalogueItem | undefined,
    toChoose: CatalogueItem[] | undefined,
    didInit: boolean) {

    if (choice && toChoose) {
      this.logInfo(`Can not choose and have a choice`)
      await networkPipe.close()
      return
    }

    const category = this.resolveCategory(choice, toChoose)

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

    await handler.handle(networkPipe, didInit)
  }

  private resolveCategory (choice: CatalogueItem | undefined, toChoose: CatalogueItem[] | undefined) {
    if (choice) {
      return choice
    }

    if (toChoose) {
      return this.categoryResolver.resolveCategory(toChoose)
    }

    return undefined
  }
}
