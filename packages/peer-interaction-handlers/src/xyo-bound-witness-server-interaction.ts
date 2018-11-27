/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 9:50:32 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-server-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 1:12:59 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoZigZagBoundWitnessBuilder
} from '@xyo-network/zig-zag-bound-witness-builder'

import {
  CatalogueItem,
  IXyoNetworkPipe,
  CATALOGUE_LENGTH_IN_BYTES,
  CATALOGUE_SIZE_OF_SIZE_BYTES
} from '@xyo-network/network'

import { IXyoBoundWitness, IXyoPayload, XyoBoundWitnessSigningService } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoNodeInteraction } from '@xyo-network/peer-interaction'
import { XyoBase } from '@xyo-network/base'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoTypeSerializer } from '@xyo-network/serialization'

/**
 * An `XyoBoundWitnessInteraction` manages a "session"
 * between two networked nodes.
 */

// tslint:disable-next-line:max-line-length
export abstract class XyoBoundWitnessServerInteraction extends XyoBase implements IXyoNodeInteraction<IXyoBoundWitness> {

  public abstract catalogueItem: CatalogueItem

  constructor(
    private readonly signers: IXyoSigner[],
    private readonly payload: IXyoPayload,
    private readonly boundWitnessSigningService: XyoBoundWitnessSigningService,
    private readonly boundWitnessSerializer: IXyoTypeSerializer<IXyoBoundWitness>
  ) {
    super()
  }

  /**
   * Does a bound witness with another node
   */

  public async run(networkPipe: IXyoNetworkPipe): Promise<IXyoBoundWitness> {
    let disconnected = false

    return new Promise(async (resolve, reject) => {
      /**
       * Listener for if and when the peer disconnects
       */
      const unregister = networkPipe.onPeerDisconnect(() => {
        disconnected = true
        this.logInfo(`Peer disconnected in xyo-bound-witness-interaction`)
      })

      this.logInfo(`Starting bound witness`)

      if (!disconnected) {
        // Create the bound witness
        const boundWitness = await this.startBoundWitness()
        if (!disconnected) {
          /** Do step 1 of the bound witness */
          const boundWitnessTransfer1 = await boundWitness.incomingData(undefined, false)

          /** Serialize the transfer value */
          const bytes = this.boundWitnessSerializer.serialize(boundWitnessTransfer1, 'buffer') as Buffer
          this.logInfo(`BoundWitness Step 1: ${bytes.toString('hex')}`)
          /** Tell the other node this is the catalogue item you chose */
          const catalogueBuffer = Buffer.alloc(CATALOGUE_LENGTH_IN_BYTES)
          catalogueBuffer.writeUInt32BE(this.catalogueItem, 0)
          const sizeOfCatalogueInBytesBuffers = Buffer.alloc(CATALOGUE_SIZE_OF_SIZE_BYTES)
          sizeOfCatalogueInBytesBuffers.writeUInt8(CATALOGUE_LENGTH_IN_BYTES, 0)

          /** Build the final message */
          const bytesToSend = Buffer.concat([
            sizeOfCatalogueInBytesBuffers,
            catalogueBuffer,
            bytes
          ])

          if (!disconnected) {
            /* Send the message and wait for reply */
            this.logInfo(`Sending BoundWitnessTransfer 1`)
            let response: Buffer | undefined

            try {
              response = await networkPipe.send(bytesToSend)
              if (!response) {
                throw new XyoError(`Unexpected undefined response in bound witness interaction`, XyoErrors.CRITICAL)
              }
            } catch (err) {
              this.logError(`Failed BoundWitnessTransfer on step 1`, err)
              return reject(err)
            }

            /** Deserialize bytes into bound witness  */
            const transferObj = this.boundWitnessSerializer.deserialize(response)

            /** Add transfer to bound witness */
            const transfer = await boundWitness.incomingData(transferObj, false)

            if (!disconnected) {
              /** serialize the bound witness transfer */
              const transferBytes = this.boundWitnessSerializer.serialize(transfer, 'buffer') as Buffer

              try {
                await networkPipe.send(transferBytes, false)
              } catch (err) {
                this.logError(`Failed BoundWitnessTransfer on step 3`, err)
                return reject(err)
              }

              /** Stop listening for disconnect events */
              unregister()

              /** Close the connection */
              await networkPipe.close()

              /** Return the resulting bound-witness */
              return resolve(boundWitness)
            }
          }
        }
      }

      return reject(
        new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoErrors.CRITICAL)
      )
    }) as Promise<IXyoBoundWitness>
  }

  private async startBoundWitness(): Promise<XyoZigZagBoundWitnessBuilder> {
    return new XyoZigZagBoundWitnessBuilder(this.signers, this.payload, this.boundWitnessSigningService)
  }
}
