/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:33:57 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-handler.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:05:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from '../../@types/xyo-network';
import { IXyoPeerConnectionHandler, IXyoCatalogueResolver, IXyoCategoryRouter } from '../../@types/xyo-node';
import { XyoBase } from '../../xyo-core-components/xyo-base';

export class XyoPeerConnectionHandlerImpl extends XyoBase implements IXyoPeerConnectionHandler {

  constructor(private readonly router: IXyoCategoryRouter, private readonly categoryResolver: IXyoCatalogueResolver) {
    super();
  }

  public async handlePeerConnection(networkPipe: IXyoNetworkPipe) {
    if (!networkPipe.otherCatalogue || networkPipe.otherCatalogue.length < 1) {
      this.logInfo(`No catalogue items in other catalogue, closing connection`);
      await networkPipe.close();
      return;
    }

    const category = this.categoryResolver.resolveCategory(networkPipe.otherCatalogue);

    if (!category) {
      this.logInfo(`Unable to resolve a category ${category}, closing connection`);
      await networkPipe.close();
      return;
    }

    const handler = this.router.getHandler(category);
    if (!handler) {
      this.logInfo(`Could not find handler for category ${category}, closing connection`);
      await networkPipe.close();
      return;
    }

    await handler.handle(networkPipe);
  }
}
