/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:43:48 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 5th October 2018 11:49:57 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoPayload } from '../components/xyo-payload';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoOriginChainStateRepository } from '../origin-chain/xyo-origin-chain-types';
import { CatalogueItem } from '../network/xyo-catalogue-item';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoBoundWitnessInteraction } from './xyo-bound-witness-interaction';

export type xyoBoundWitnessHandlerFn = (networkPipe: XyoNetworkPipe) => Promise<XyoBoundWitness>;

export type xyoBoundWitnessPayloadProvider =
  (originState: XyoOriginChainStateRepository) => Promise<XyoPayload>;

export type xyoPeerConnectionHandler = (networkPipe: XyoNetworkPipe) => Promise<void>;

export interface XyoBoundWitnessPayloadProvider {
  getPayload: xyoBoundWitnessPayloadProvider;
}

export interface XyoPeerConnectionHandler {
  handlePeerConnection: xyoPeerConnectionHandler;
}

export interface XyoPeerConnectionDelegate {
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
  run(): Promise<T>;
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
    packer: XyoPacker,
    networkPipe: XyoNetworkPipe,
    signers: XyoSigner[],
    payload: XyoPayload
  ) => XyoBoundWitnessInteraction;
}
