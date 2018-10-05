/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 10:03:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-provider-builder.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 5th October 2018 11:51:41 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPeerConnectionDelegate, XyoBoundWitnessSuccessListener, XyoCategoryRouter, XyoBoundWitnessHandlerProvider, XyoCatalogueResolver } from './xyo-node-types';
import { XyoPeerConnectionDelegateImpl } from './xyo-peer-connection-provider-impl';
import { XyoNetworkProcedureCatalogue, XyoNetworkProviderInterface } from '../network/xyo-network';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoHashProvider } from '../hash-provider/xyo-hash-provider';
import { XyoBoundWitnessPayloadProviderImpl } from './xyo-bound-witness-payload-provider-impl';
import { XyoBoundWitnessHandlerProviderImpl } from './xyo-bound-witness-handler-provider-impl';
import { XyoPeerConnectionHandlerImpl } from './xyo-peer-connection-handler-impl';
import { XyoOriginBlockRepository, XyoOriginChainStateRepository } from '../origin-chain/xyo-origin-chain-types';
import { XyoBoundWitnessStandardServerInteraction } from './bound-witness-handlers/xyo-bound-witness-standard-server-interaction';
import { CatalogueItem } from '../network/xyo-catalogue-item';
import { XyoBoundWitnessStandardClientInteraction } from './xyo-bound-witness-standard-client-interaction';
import { XyoBoundWitnessTakeOriginChainServerInteraction } from './bound-witness-handlers/xyo-bound-witness-take-origin-chain-server-interaction';

export class XyoPeerConnectionProviderFactory implements XyoCategoryRouter, XyoCatalogueResolver {

  constructor(
    private readonly network: XyoNetworkProviderInterface,
    private readonly catalogue: XyoNetworkProcedureCatalogue,
    private readonly xyoPacker: XyoPacker,
    private readonly hashingProvider: XyoHashProvider,
    private readonly originChainStateManager: XyoOriginChainStateRepository,
    private readonly originChainNavigator: XyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: XyoBoundWitnessPayloadProviderImpl,
    private readonly boundWitnessSuccessListener: XyoBoundWitnessSuccessListener,
    private readonly isServer: boolean,
    private readonly catalogueResolver?: XyoCatalogueResolver
  ) {}

  public newInstance(): XyoPeerConnectionDelegate {
    return new XyoPeerConnectionDelegateImpl(
      this.network,
      this.catalogue,
      new XyoPeerConnectionHandlerImpl(this, this)
    );
  }

  public getHandler(catalogueItem: CatalogueItem): XyoBoundWitnessHandlerProvider | undefined {
    if (this.isServer) {
      switch (catalogueItem) {
        case CatalogueItem.BOUND_WITNESS:
          return new XyoBoundWitnessHandlerProviderImpl(
            this.xyoPacker,
            this.hashingProvider,
            this.originChainStateManager,
            this.originChainNavigator,
            this.boundWitnessPayloadProvider,
            this.boundWitnessSuccessListener,
            {
              newInstance: (packer, pipe, signers, payload) =>  {
                return new XyoBoundWitnessStandardServerInteraction(packer, pipe, signers, payload);
              }
            }
          );
        case CatalogueItem.TAKE_ORIGIN_CHAIN:
          return new XyoBoundWitnessHandlerProviderImpl(
            this.xyoPacker,
            this.hashingProvider,
            this.originChainStateManager,
            this.originChainNavigator,
            this.boundWitnessPayloadProvider,
            this.boundWitnessSuccessListener,
            {
              newInstance: (packer, pipe, signers, payload) =>  {
                return new XyoBoundWitnessTakeOriginChainServerInteraction(packer, pipe, signers, payload);
              }
            }
          );
        default:
          return undefined;
      }
    }

    switch (catalogueItem) {
      case CatalogueItem.BOUND_WITNESS:
        return new XyoBoundWitnessHandlerProviderImpl(
          this.xyoPacker,
          this.hashingProvider,
          this.originChainStateManager,
          this.originChainNavigator,
          this.boundWitnessPayloadProvider,
          this.boundWitnessSuccessListener,
          {
            newInstance: (packer, pipe, signers, payload) =>  {
              return new XyoBoundWitnessStandardClientInteraction(packer, pipe, signers, payload);
            }
          }
        );
      case CatalogueItem.GIVE_ORIGIN_CHAIN:
        return undefined;
        break;
      default:
        return undefined;
    }
  }

  public resolveCategory(catalogueItems: CatalogueItem[]): CatalogueItem | undefined {
    if (this.catalogueResolver) {
      return this.catalogueResolver.resolveCategory(catalogueItems);
    }

    return (catalogueItems && catalogueItems.length > 0 && catalogueItems[0]) || undefined;
  }
}
