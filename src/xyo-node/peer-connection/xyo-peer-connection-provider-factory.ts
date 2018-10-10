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

import { IXyoPeerConnectionDelegate, IXyoBoundWitnessSuccessListener, IXyoCategoryRouter, IXyoBoundWitnessHandlerProvider, IXyoCatalogueResolver } from '../../@types/xyo-node';
import { XyoPeerConnectionDelegate } from './xyo-peer-connection-provider';
import { IXyoNetworkProcedureCatalogue, IXyoNetworkProviderInterface } from '../../@types/xyo-network';
import { XyoPacker } from '../../xyo-serialization/xyo-packer';
import { IXyoHashProvider } from '../../@types/xyo-hashing';
import { XyoBoundWitnessPayloadProvider } from '../xyo-bound-witness-payload-provider';
import { XyoBoundWitnessHandlerProvider } from '../xyo-bound-witness-handler-provider';
import { XyoPeerConnectionHandlerImpl } from './xyo-peer-connection-handler';
import { IXyoOriginBlockRepository, IXyoOriginChainStateRepository } from '../../@types/xyo-origin-chain';
import { XyoBoundWitnessStandardServerInteraction } from '../bound-witness-interactions/xyo-bound-witness-standard-server-interaction';
import { CatalogueItem } from '../../xyo-network/xyo-catalogue-item';
import { XyoBoundWitnessStandardClientInteraction } from '../bound-witness-interactions/xyo-bound-witness-standard-client-interaction';
import { XyoBoundWitnessTakeOriginChainServerInteraction } from '../bound-witness-interactions/xyo-bound-witness-take-origin-chain-server-interaction';

export class XyoPeerConnectionProviderFactory implements IXyoCategoryRouter, IXyoCatalogueResolver {

  constructor(
    private readonly network: IXyoNetworkProviderInterface,
    private readonly catalogue: IXyoNetworkProcedureCatalogue,
    private readonly xyoPacker: XyoPacker,
    private readonly hashingProvider: IXyoHashProvider,
    private readonly originChainStateManager: IXyoOriginChainStateRepository,
    private readonly originChainNavigator: IXyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: XyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly isServer: boolean,
    private readonly catalogueResolver?: IXyoCatalogueResolver
  ) {}

  public newInstance(): IXyoPeerConnectionDelegate {
    return new XyoPeerConnectionDelegate(
      this.network,
      this.catalogue,
      new XyoPeerConnectionHandlerImpl(this, this)
    );
  }

  public getHandler(catalogueItem: CatalogueItem): IXyoBoundWitnessHandlerProvider | undefined {
    if (this.isServer) {
      switch (catalogueItem) {
        case CatalogueItem.BOUND_WITNESS:
          return new XyoBoundWitnessHandlerProvider(
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
          return new XyoBoundWitnessHandlerProvider(
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
        return new XyoBoundWitnessHandlerProvider(
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
