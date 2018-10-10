/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:43:48 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:11:01 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from './xyo-network';
import { XyoPayload } from '../xyo-core-components/xyo-payload';
import { XyoBoundWitness } from '../xyo-bound-witness/xyo-bound-witness';
import { IXyoOriginChainStateRepository } from './xyo-origin-chain';
import { CatalogueItem } from '../xyo-network/xyo-catalogue-item';
import { IXyoSigner } from './xyo-signing';

export type xyoBoundWitnessHandlerFn = (networkPipe: IXyoNetworkPipe) => Promise<XyoBoundWitness>;

export type xyoBoundWitnessPayloadProvider =
  (originState: IXyoOriginChainStateRepository) => Promise<XyoPayload>;

export type xyoPeerConnectionHandler = (networkPipe: IXyoNetworkPipe) => Promise<void>;

export interface IXyoBoundWitnessPayloadProvider {
  getPayload: xyoBoundWitnessPayloadProvider;
}

export interface IXyoPeerConnectionHandler {
  handlePeerConnection: xyoPeerConnectionHandler;
}

export interface IXyoPeerConnectionDelegateInterface {
  handlePeerConnection: xyoPeerConnectionHandler;
  provideConnection(): Promise<IXyoNetworkPipe>;
  stopProvidingConnections(): Promise<void>;
}

export interface IXyoBoundWitnessHandlerProvider {
  handle: xyoBoundWitnessHandlerFn;
}

export interface IXyoBoundWitnessSuccessListener {
  onBoundWitnessSuccess(boundWitness: XyoBoundWitness): Promise<void>;
}

export interface IXyoNodeInteraction <T> {
  run(networkPipe: IXyoNetworkPipe): Promise<T>;
}

export type resolveCategoryFn = (catalogueItems: CatalogueItem[]) => CatalogueItem | undefined;

export interface IXyoCatalogueResolver {
  resolveCategory: resolveCategoryFn;
}

export interface IXyoCategoryRouter {
  getHandler(catalogueItem: CatalogueItem): IXyoBoundWitnessHandlerProvider | undefined;
}

export interface IXyoBoundWitnessInteractionFactory {
  newInstance: (
    signers: IXyoSigner[],
    payload: XyoPayload
  ) => IXyoNodeInteraction<XyoBoundWitness>;
}
