/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:33:57 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-handler.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 28th September 2018 10:32:11 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoPeerConnectionHandler, XyoCatalogueResolver, XyoCategoryRouter } from './xyo-node-types';
import { XyoBase } from '../components/xyo-base';

export class XyoPeerConnectionHandlerImpl extends XyoBase implements XyoPeerConnectionHandler {

  constructor(private readonly router: XyoCategoryRouter, private readonly categoryResolver: XyoCatalogueResolver) {
    super();
  }

  public async handlePeerConnection(networkPipe: XyoNetworkPipe) {
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
