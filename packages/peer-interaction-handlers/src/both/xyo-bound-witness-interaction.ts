/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 9:50:32 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-server-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th February 2019 2:37:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
    CatalogueItem,
    IXyoNetworkPipe,
    CATALOGUE_LENGTH_IN_BYTES,
    CATALOGUE_SIZE_OF_SIZE_BYTES
  } from '@xyo-network/network'

import { IXyoBoundWitness, IXyoPayload, FetterOrWitness, XyoKeySet, XyoFetter, XyoSignatureSet, XyoWitness, XyoBoundWitnessFragment } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoNodeInteraction } from '@xyo-network/peer-interaction'
import { XyoBase } from '@xyo-network/base'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { InnerBoundWitness } from '../xyo-inner-bound-witness'
import { XyoBoundWitnessClientInteraction } from '../client/xyo-bound-witness-client-interaction'
import { XyoBoundWitnessServerInteraction } from '../server/xyo-bound-witness-server-interaction'

  /**
   * An `XyoBoundWitnessInteraction` manages a "session"
   * between two networked nodes.
   */

  // tslint:disable-next-line:max-line-length
export class XyoBoundWitnessInteraction extends XyoBase implements IXyoNodeInteraction<IXyoBoundWitness> {
  private serverHandler: IXyoNodeInteraction<IXyoBoundWitness>
  private clientHandler: IXyoNodeInteraction<IXyoBoundWitness>

  constructor(
    private readonly signers: IXyoSigner[],
    private readonly payload: IXyoPayload,
    private readonly serializationService: IXyoSerializationService,
    public catalogueItem: CatalogueItem
  ) {
    super()

    this.clientHandler = new XyoBoundWitnessClientInteraction(signers, payload, serializationService, catalogueItem)
    this.serverHandler = new XyoBoundWitnessServerInteraction(signers, payload, serializationService, catalogueItem)
  }

  /**
   * Does a bound witness with another node
   */
  public async run(networkPipe: IXyoNetworkPipe, didInit: boolean): Promise<IXyoBoundWitness> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await this.performInteraction(networkPipe, didInit))
      } catch (err) {
        reject(err)
      }
    }) as Promise<IXyoBoundWitness>
  }

  public async performInteraction(networkPipe: IXyoNetworkPipe, didInit: boolean) {
    if (didInit) {
      return this.clientHandler.run(networkPipe, didInit)
    }

    return this.serverHandler.run(networkPipe, didInit)
  }
}
