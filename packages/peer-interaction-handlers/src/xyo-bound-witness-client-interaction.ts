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
  import { InnerBoundWitness } from './xyo-inner-bound-witness'

  
  /**
   * An `XyoBoundWitnessInteraction` manages a "session"
   * between two networked nodes.
   */
  export abstract class XyoBoundWitnessClientInteraction extends XyoBase implements IXyoNodeInteraction<IXyoBoundWitness> {
    
    public abstract catalogueItem: CatalogueItem

    constructor(
      private readonly signers: IXyoSigner[],
      private readonly payload: IXyoPayload,
      private readonly serializationService: IXyoSerializationService
    ) {
      super()
    }
  
    /**
     * Does a bound witness with another node
     */
    public async run(networkPipe: IXyoNetworkPipe): Promise<IXyoBoundWitness> {
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
      const fetter = new XyoFetter(keySet, this.payload.heuristics)
      const { bytesToSend } = this.getFirstMessage()
      const encodedResponse = await this.sendMessage(networkPipe, bytesToSend)

      const {cat, response} = this.getChoiceAndResponse(encodedResponse)

      // this is their fetter
      const transferQuery = this.serializationService.deserialize(response).query()
  
      // create the bound witness object staring with their fetter
      const aggregator: Buffer[] = [transferQuery.query([0]).readData(true)]

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
  
        // now we send back the fetter and signature
        const theirSig = await this.sendMessage(networkPipe, fragment.serialize())
        const otherWitness = this.serializationService.deserialize(theirSig).query()
        aggregator.push(otherWitness.query([0]).readData(true))
  
        /** Stop listening for disconnect events */
        unregister()
  
        /** Close the connection */
        await networkPipe.close()
        const fragmentParts : FetterOrWitness[] = []

        aggregator.forEach((item) => {
            this.serializationService
            .deserialize(item)
            .hydrate<FetterOrWitness>()
        })

        return new InnerBoundWitness(fragmentParts, signingData)
      }
  
      throw new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoErrors.CRITICAL)
    }

    private getChoiceAndResponse (message : Buffer) {
        const sizeOfCat = message.readUInt8(0)        
        const response = message.slice(1 + sizeOfCat, message.length)
        const cat = message.buffer.slice(1, sizeOfCat + 1)

        return {cat, response}
    }
  
    private getFirstMessage() {
  
      /** Tell the other node this is the catalogue item you chose */
      const catalogueBuffer = Buffer.alloc(CATALOGUE_LENGTH_IN_BYTES)
      catalogueBuffer.writeUInt32BE(this.catalogueItem, 0)
      const sizeOfCatalogueInBytesBuffers = Buffer.alloc(CATALOGUE_SIZE_OF_SIZE_BYTES)
      sizeOfCatalogueInBytesBuffers.writeUInt8(CATALOGUE_LENGTH_IN_BYTES, 0)
  
      /** Build the final message */
      const bytesToSend = Buffer.concat([
        sizeOfCatalogueInBytesBuffers,
        catalogueBuffer,
      ])

      return { bytesToSend }
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
  
  