/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 9:33:57 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-handler.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 10:54:02 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { CatalogueItem } from '../network/xyo-catalogue-item';
import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoBoundWitnessHandlerProvider, XyoPeerConnectionHandler } from './xyo-node-types';

export class XyoPeerConnectionHandlerImpl implements XyoPeerConnectionHandler {

  constructor(private readonly boundWitnessHandler: XyoBoundWitnessHandlerProvider) {}

  public async handlePeerConnection(networkPipe: XyoNetworkPipe) {
    if (!networkPipe.otherCatalogue || networkPipe.otherCatalogue.length < 1) {
      await networkPipe.close();
      return;
    }

    const category = this.resolveCategory(networkPipe.otherCatalogue!);
    if (!category) {
      await networkPipe.close();
      return;
    }

    switch (category) {
      case CatalogueItem.BOUND_WITNESS:
        await this.boundWitnessHandler.handle(networkPipe);
        return;
    }
  }

  /**
   * Given a list of catalogue items a peer is willing to do, this resolves to a particular
   * catalogue item.
   */

  private resolveCategory(otherCatalogueItems: CatalogueItem[]): CatalogueItem | undefined {
    const boundWitnessCatalogueItem = otherCatalogueItems.find((catalogueItem) => {
      return catalogueItem === CatalogueItem.BOUND_WITNESS;
    });

    return boundWitnessCatalogueItem;
  }
}
