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

import { XyoNetworkPipe } from './xyo-network';
import { XyoPayload } from '../xyo-core-components/xyo-payload';
import { XyoBoundWitness } from '../xyo-bound-witness/xyo-bound-witness';
import { XyoOriginChainStateRepository } from './xyo-origin-chain';
import { CatalogueItem } from '../xyo-network/xyo-catalogue-item';
import { XyoSigner } from './xyo-signing';

export type xyoBoundWitnessHandlerFn = (networkPipe: XyoNetworkPipe) => Promise<XyoBoundWitness>;

export type xyoBoundWitnessPayloadProvider =
  (originState: XyoOriginChainStateRepository) => Promise<XyoPayload>;

export type xyoPeerConnectionHandler = (networkPipe: XyoNetworkPipe) => Promise<void>;

export interface XyoBoundWitnessPayloadProvider {
  getPayload: xyoBoundWitnessPayloadProvider;
}

export interface XyoPeerConnectionHandlerInterface {
  handlePeerConnection: xyoPeerConnectionHandler;
}

export interface XyoPeerConnectionDelegateInterface {
  handlePeerConnection: xyoPeerConnectionHandler;
  provideConnection(): Promise<XyoNetworkPipe>;
  stopProvidingConnections(): Promise<void>;
}

export interface XyoBoundWitnessHandlerProvider {
  handle: xyoBoundWitnessHandlerFn;
}

export interface XyoBoundWitnessSuccessListener {
  onBoundWitnessSuccess(boundWitness: XyoBoundWitness): Promise<void>;
}

export interface XyoNodeInteraction <T> {
  run(networkPipe: XyoNetworkPipe): Promise<T>;
}

export type resolveCategoryFn = (catalogueItems: CatalogueItem[]) => CatalogueItem | undefined;

export interface XyoCatalogueResolver {
  resolveCategory: resolveCategoryFn;
}

export interface XyoCategoryRouter {
  getHandler(catalogueItem: CatalogueItem): XyoBoundWitnessHandlerProvider | undefined;
}

export interface XyoBoundWitnessInteractionFactory {
  newInstance: (
    signers: XyoSigner[],
    payload: XyoPayload
  ) => XyoNodeInteraction<XyoBoundWitness>;
}
