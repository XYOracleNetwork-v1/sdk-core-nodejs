/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:43:48 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 27th September 2018 11:10:00 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoPayload } from '../components/xyo-payload';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoOriginChainStateRepository } from '../origin-chain/xyo-origin-chain-types';

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
