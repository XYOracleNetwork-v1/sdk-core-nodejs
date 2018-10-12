/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:43:48 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 10th October 2018 4:45:52 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe } from './xyo-network';
import { XyoPayload } from '../xyo-bound-witness/components/payload/xyo-payload';
import { XyoBoundWitness } from '../xyo-bound-witness/bound-witness/xyo-bound-witness';
import { IXyoOriginChainStateRepository } from './xyo-origin-chain';
import { CatalogueItem } from '../xyo-network/xyo-catalogue-item';
import { IXyoSigner } from './xyo-signing';

/**
 * An interface to abstract what goes into a payload of a bound-witness
 */
export interface IXyoBoundWitnessPayloadProvider {

  /** Returns the payload for the bound-witness given the origin-state of the current chain */
  getPayload(originState: IXyoOriginChainStateRepository): Promise<XyoPayload>;
}

/**
 * Allows multiplexing / routing based on a Category. Delegates
 * network communication to the handler
 */
export interface IXyoPeerConnectionHandler {
  /** Handles peer connection, handler should call `close` on the pipe when done handling */
  handlePeerConnection(networkPipe: IXyoNetworkPipe): Promise<void>;
}

/** A delegate for managing peer-connections */
export interface IXyoPeerConnectionDelegate {

  /** Handles a peer connection once it is provided */
  handlePeerConnection(networkPipe: IXyoNetworkPipe): Promise<void>;

  /** Provides a connection to a peer */
  provideConnection(): Promise<IXyoNetworkPipe>;

  /** Calling `stopProvidingConnections` will make it so that the delegate does not provide any future connections */
  stopProvidingConnections(): Promise<void>;
}

/**
 * Since all operations (currently) are done through XyoBoundWitnesses,
 * this interface allows routing and delegating to particular handlers
 * that resolve to an `XyoBoundWitness` which can then be handled in
 * a uniform way
 */
export interface IXyoBoundWitnessHandlerProvider {

  /** Given a `IXyoNetworkPipe` performs an operation that resolves to an `XyoBoundWitness` */
  handle(networkPipe: IXyoNetworkPipe): Promise<XyoBoundWitness>;
}

/**
 * A success hook for bound-witnesses. Created so that XyoNodes can react
 * to successful bound-witnesses and update the parameters for managing
 * an `XyoNode`
 */

export interface IXyoBoundWitnessSuccessListener {
  onBoundWitnessSuccess(boundWitness: XyoBoundWitness): Promise<void>;
}

/** A generic interface for node-interaction handler */
export interface IXyoNodeInteraction <T> {
  run(networkPipe: IXyoNetworkPipe): Promise<T>;
}

/**
 * Allows for dynamic decision-making / control flow by an `XyoNode` as to which
 * category should be chosen given arbitrary criteria
 */

export interface IXyoCatalogueResolver {

/**
 * Should resolve to the particular category the node wishes to perform.
 * For example, if the catalogue-items are `GIVE_ORIGIN_CHAIN`, `BOUND_WITNESS`
 * an archivist would return `TAKE_ORIGIN_CHAIN`.
 */
  resolveCategory(catalogueItems: CatalogueItem[]): CatalogueItem | undefined;
}

/**
 * Provides basic routing functionality. Keys off a catalogue item
 */
export interface IXyoCategoryRouter {

  /** Optionally returns a `IXyoBoundWitnessHandlerProvider` based off the catalogueItem */
  getHandler(catalogueItem: CatalogueItem): IXyoBoundWitnessHandlerProvider | undefined;
}

/** A factory for providing instance of bound-witness interactions */
export interface IXyoBoundWitnessInteractionFactory {
  newInstance: (signers: IXyoSigner[], payload: XyoPayload) => IXyoNodeInteraction<XyoBoundWitness>;
}
