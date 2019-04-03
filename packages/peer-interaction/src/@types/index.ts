/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 4:41:19 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 19th February 2019 6:00:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkPipe, CatalogueItem } from '@xyo-network/network'
import { IXyoBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoOriginChainRepository } from '@xyo-network/origin-chain'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoSerializableObject } from '@xyo-network/serialization'

/**
 * Since all operations (currently) are done through XyoBoundWitnesses,
 * this interface allows routing and delegating to particular handlers
 * that resolve to an `XyoBoundWitness` which can then be handled in
 * a uniform way
 */
export interface IXyoBoundWitnessHandlerProvider {

  /** Given a `IXyoNetworkPipe` performs an operation that resolves to an `XyoBoundWitness` */
  handle(networkPipe: IXyoNetworkPipe, didInit: boolean): Promise<IXyoBoundWitness>
}

/**
 * An interface to abstract what goes into a payload of a bound-witness
 */
export interface IXyoBoundWitnessPayloadProvider {

  /** Returns the payload for the bound-witness given the origin-state of the current chain */
  getPayload(originState: IXyoOriginChainRepository, choice: CatalogueItem): Promise<IXyoPayload>
}

/**
 * A success hook for bound-witnesses. Created so that XyoNodes can react
 * to successful bound-witnesses and update the parameters for managing
 * an `XyoNode`
 */

export interface IXyoBoundWitnessSuccessListener {
  onBoundWitnessSuccess(boundWitness: IXyoBoundWitness, mutex: any, choice: CatalogueItem): Promise<void>
}

/** A generic interface for node-interaction handler */
export interface IXyoNodeInteraction <T> {
  run(networkPipe: IXyoNetworkPipe, didInit: boolean): Promise<T>
}

/** A factory for providing instance of bound-witness interactions */
export interface IXyoBoundWitnessInteractionFactory {
  newInstance: (signers: IXyoSigner[], payload: IXyoPayload) => IXyoNodeInteraction<IXyoBoundWitness>
}

export interface IXyoBoundWitnessOption {
  signed: () => Promise<IXyoSerializableObject | null>,
  unsigned: () => Promise<IXyoSerializableObject | null>,
}
