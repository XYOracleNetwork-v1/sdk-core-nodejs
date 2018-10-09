/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 10:03:52 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-connection-provider-builder.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:11:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPeerConnectionDelegateInterface, XyoBoundWitnessSuccessListener, XyoCategoryRouter, XyoBoundWitnessHandlerProvider, XyoCatalogueResolver } from '../@types/xyo-node';
import { XyoPeerConnectionDelegate } from './xyo-peer-connection-provider';
import { XyoNetworkProcedureCatalogue, XyoNetworkProviderInterface } from '../@types/xyo-network';
import { XyoPacker } from '../xyo-serialization/xyo-packer';
import { XyoHashProvider } from '../@types/xyo-hashing';
import { XyoBoundWitnessPayloadProviderImpl } from './xyo-bound-witness-payload-provider-impl';
import { XyoBoundWitnessHandlerProviderImpl } from './xyo-bound-witness-handler-provider-impl';
import { XyoPeerConnectionHandlerImpl } from './xyo-peer-connection-handler';
import { XyoOriginBlockRepository, XyoOriginChainStateRepository } from '../@types/xyo-origin-chain';
import { XyoBoundWitnessStandardServerInteraction } from './bound-witness-interactions/xyo-bound-witness-standard-server-interaction';
import { CatalogueItem } from '../xyo-network/xyo-catalogue-item';
import { XyoBoundWitnessStandardClientInteraction } from './bound-witness-interactions/xyo-bound-witness-standard-client-interaction';
import { XyoBoundWitnessTakeOriginChainServerInteraction } from './bound-witness-interactions/xyo-bound-witness-take-origin-chain-server-interaction';

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

  public newInstance(): XyoPeerConnectionDelegateInterface {
    return new XyoPeerConnectionDelegate(
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
              newInstance: (signers, payload) =>  {
                return new XyoBoundWitnessStandardServerInteraction(this.xyoPacker, signers, payload);
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
              newInstance: (signers, payload) =>  {
                return new XyoBoundWitnessTakeOriginChainServerInteraction(this.xyoPacker, signers, payload);
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
            newInstance: (signers, payload) =>  {
              return new XyoBoundWitnessStandardClientInteraction(this.xyoPacker, signers, payload);
            }
          }
        );
      case CatalogueItem.GIVE_ORIGIN_CHAIN:
        return undefined;
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
