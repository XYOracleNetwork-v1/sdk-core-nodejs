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
  } from '@xyo-network/network'

import { IXyoBoundWitness, IXyoPayload, FetterOrWitness, XyoKeySet, XyoFetter, XyoSignatureSet, XyoWitness, XyoBoundWitnessFragment } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoNodeInteraction } from '@xyo-network/peer-interaction'
import { XyoBase } from '@xyo-network/base'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { InnerBoundWitness } from '../xyo-inner-bound-witness'

  /**
   * An `XyoBoundWitnessInteraction` manages a "session"
   * between two networked nodes.
   */

  // tslint:disable-next-line:max-line-length
export class XyoBoundWitnessClientInteraction extends XyoBase implements IXyoNodeInteraction<IXyoBoundWitness> {

  constructor(
    private readonly signers: IXyoSigner[],
    private readonly payload: IXyoPayload,
    private readonly serializationService: IXyoSerializationService,
    public catalogueItem: CatalogueItem
  ) {
    super()
  }

  /**
   * Does a bound witness with another node
   */
  public async run(networkPipe: IXyoNetworkPipe, didInit: boolean): Promise<IXyoBoundWitness> {
    if (!didInit) {
      throw new Error("Server init can not be used in a client interaction!")
    }

    return new Promise(async (resolve, reject) => {
      try {
        resolve(await this.performInteraction(networkPipe))
      } catch (err) {
        reject(err)
      }
    }) as Promise<IXyoBoundWitness>
  }

  public async performInteraction(networkPipe: IXyoNetworkPipe) {
    this.logInfo(`Starting bound witness`)
    let disconnected = false
      /**
       * Listener for if and when the peer disconnects
       */
    const unregister = networkPipe.onPeerDisconnect(() => {
      disconnected = true
      this.logInfo(`Peer disconnected in xyo-bound-witness-interaction`)
    })

    const keySet = new XyoKeySet(this.signers.map(s => s.publicKey))
    const fetter = new XyoFetter(keySet, this.payload.heuristics.concat(networkPipe.networkHeuristics))

    console.log(fetter.serializeHex())

    // this is their fetter
    const transferQuery = this.serializationService.deserialize(networkPipe.initiationData!).query()

    // create the bound witness object staring with their fetter
    const aggregator: Buffer[] = [transferQuery.getChildAt(0).readData(true)]

    // add our fetter to the bound witness
    aggregator.push(fetter.serialize())

    // at this point the bound witness data has been collected so we get the signing data
    const signingData = Buffer.concat(aggregator)
    this.logInfo(`Signing Data`, signingData.toString('hex'))

    const signatures = await Promise.all(this.signers.map((signer) => {
      return signer.signData(signingData)
    }))

    if (!disconnected) {
      const signatureSet = new XyoSignatureSet(signatures)
      const witness = new XyoWitness(signatureSet, this.payload.metadata)
      const fragment = new XyoBoundWitnessFragment([fetter, witness])
      aggregator.push(witness.serialize())

      // now we send back the fetter and signature
      const theirSig = await this.sendMessage(networkPipe, fragment.serialize())
      const otherWitness = this.serializationService.deserialize(theirSig).query()
      aggregator.push(otherWitness.query([0]).readData(true))

      /** Stop listening for disconnect events */
      unregister()

      /** Close the connection */
      await networkPipe.close()
      const fragmentParts: FetterOrWitness[] = []

      aggregator.forEach((item) => {
        fragmentParts.push(this.serializationService
          .deserialize(item)
          .hydrate<FetterOrWitness>())
      })

      return new InnerBoundWitness(fragmentParts, signingData)
    }

    throw new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoErrors.CRITICAL)
  }

  private async sendMessage(networkPipe: IXyoNetworkPipe, bytesToSend: Buffer): Promise<Buffer> {
    try {
      let response: Buffer | undefined
      response = await networkPipe.send(bytesToSend)
      if (!response) {
        throw new XyoError(`Unexpected undefined response in bound witness interaction`, XyoErrors.CRITICAL)
      }
      return response
    } catch (err) {
      this.logError(`Failed BoundWitnessTransfer on step 1`, err)
      throw err
    }
  }
}
