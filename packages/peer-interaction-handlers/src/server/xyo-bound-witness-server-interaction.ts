/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 9:50:32 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-server-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  CatalogueItem,
  IXyoNetworkPipe,
  CATALOGUE_LENGTH_IN_BYTES,
  CATALOGUE_SIZE_OF_SIZE_BYTES
} from '@xyo-network/network'

import { IXyoBoundWitness, IXyoPayload, XyoBoundWitness, FetterOrWitness, XyoKeySet, XyoFetter, XyoFetterSet, XyoSignatureSet, XyoWitness, XyoWitnessSet } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoNodeInteraction } from '@xyo-network/peer-interaction'
import { XyoBase } from '@xyo-network/base'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoSerializationService, ParseQuery } from '@xyo-network/serialization'
import { InnerBoundWitness } from '../xyo-inner-bound-witness'

/**
 * An `XyoBoundWitnessInteraction` manages a "session"
 * between two networked nodes.
 */

// tslint:disable-next-line:max-line-length
export class XyoBoundWitnessServerInteraction extends XyoBase implements IXyoNodeInteraction<IXyoBoundWitness> {

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
    if (didInit) {
      throw new Error("Client init can not be used in a server interaction!")
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

    const { bytesToSend, fetter } = this.getFirstMessage()
    const response = await this.sendMessage(networkPipe, bytesToSend)
    const transferQuery = this.serializationService.deserialize(response).query()

    const numberOfItemsInTransfer = transferQuery.getChildrenCount()
    if (numberOfItemsInTransfer < 2 || numberOfItemsInTransfer % 2 !== 0) {
      throw new XyoError(`Invalid Bound Witness Fragments`)
    }

    const aggregator: Buffer[] = [fetter.serialize()]
    aggregator.push(transferQuery.query([0]).readData(true))
    const signingData = Buffer.concat(aggregator)
    this.logInfo(`Signing Data`, signingData.toString('hex'))
    const signatures = await Promise.all(this.signers.map((signer) => {
      return signer.signData(signingData)
    }))

    if (!disconnected) {
      const signatureSet = new XyoSignatureSet(signatures)
      const witness = new XyoWitness(signatureSet, this.payload.metadata)
      const witnessSet = new XyoWitnessSet([witness])

      await networkPipe.send(witnessSet.serialize(), false)

      /** Stop listening for disconnect events */
      unregister()

      /** Close the connection */

      await networkPipe.close()

      const fragmentParts = transferQuery.reduceChildren((memo, parseResult) => {
        memo.push(
            this.serializationService
              .deserialize(new ParseQuery(parseResult).readData(true))
              .hydrate<FetterOrWitness>()
          )

        return memo
      }, [fetter] as FetterOrWitness[])
      fragmentParts.push(witness)
      return new InnerBoundWitness(fragmentParts, signingData)
    }

    throw new XyoError(`Peer disconnected in xyo-bound-witness-interaction`)
  }

  private getFirstMessage() {
    const keySet = new XyoKeySet(this.signers.map(s => s.publicKey))
    const fetter = new XyoFetter(keySet, this.payload.heuristics)
    const fetterSet = new XyoFetterSet([fetter])

    /** Tell the other node this is the catalogue item you chose */
    const catalogueBuffer = Buffer.alloc(CATALOGUE_LENGTH_IN_BYTES)
    catalogueBuffer.writeUInt32BE(this.catalogueItem, 0)
    const sizeOfCatalogueInBytesBuffers = Buffer.alloc(CATALOGUE_SIZE_OF_SIZE_BYTES)
    sizeOfCatalogueInBytesBuffers.writeUInt8(CATALOGUE_LENGTH_IN_BYTES, 0)

    /** Build the final message */
    const bytesToSend = Buffer.concat([
      sizeOfCatalogueInBytesBuffers,
      catalogueBuffer,
      fetterSet.serialize()
    ])
    return { bytesToSend, fetter }
  }

  private async sendMessage(networkPipe: IXyoNetworkPipe, bytesToSend: Buffer): Promise<Buffer> {
    try {
      let response: Buffer | undefined
      response = await networkPipe.send(bytesToSend)
      if (!response) {
        throw new XyoError(`Unexpected undefined response in bound witness interaction`)
      }
      return response
    } catch (err) {
      this.logError(`Failed BoundWitnessTransfer on step 1`, err)
      throw err
    }
  }
}
