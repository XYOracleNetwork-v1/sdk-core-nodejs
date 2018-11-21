/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 10:34:36 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-standard-client-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 10:41:41 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoZigZagBoundWitnessBuilder,
  XyoBoundWitnessTransfer
} from '@xyo-network/zig-zag-bound-witness-builder'

import { IXyoBoundWitness, IXyoPayload, XyoBoundWitnessSigningService } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoNodeInteraction } from '@xyo-network/peer-interaction'
import { XyoBase } from '@xyo-network/base'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoSerializationService } from '@xyo-network/serialization'

import {
  IXyoNetworkPipe
} from '@xyo-network/network'

/**
 * An `XyoBoundWitnessClientInteraction` manages a "session"
 * between two networked nodes.
 */

export class XyoBoundWitnessStandardClientInteraction extends XyoBase implements IXyoNodeInteraction<IXyoBoundWitness> {

  constructor (
    private readonly signers: IXyoSigner[],
    private readonly payload: IXyoPayload,
    private readonly boundWitnessSigningService: XyoBoundWitnessSigningService,
    private readonly serializationService: IXyoSerializationService
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
          if (!networkPipe.initiationData) {
            throw new XyoError(`No initiation data found`, XyoErrors.CRITICAL)
          }

          const boundWitnessTransfer1 = this.serializationService
            .deserialize<XyoBoundWitnessTransfer>(networkPipe.initiationData)

          const boundWitnessTransfer2 = await boundWitness.incomingData(boundWitnessTransfer1, true)

          /** Serialize the transfer value */
          const bytes = this.serializationService.serialize(boundWitnessTransfer2, 'buffer') as Buffer

          if (!disconnected) {
            /* Send the message and wait for reply */
            this.logInfo(`Sending bound witness message`)
            let response: Buffer | undefined
            try {
              response = await networkPipe.send(bytes)
              if (!response) {
                throw new XyoError(`No Response data found`, XyoErrors.CRITICAL)
              }
            } catch (err) {
              this.logError(`Failing to send bound witness message`, err)
              return reject(err)
            }

            this.logInfo(`Received bound witness response`)

            /** Deserialize bytes into bound witness transfer  */
            const transferObj = this.serializationService.deserialize<XyoBoundWitnessTransfer>(response)

            /** Add transfer to bound witness */
            await boundWitness.incomingData(transferObj, false)

            /** Stop listening for disconnect events */
            unregister()

            /** Close the connection */
            await networkPipe.close()

            /** Return the resulting bound-witness */
            return resolve(boundWitness)
          }
        }
      }

      return reject(new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoErrors.CRITICAL))
    }) as Promise<IXyoBoundWitness>
  }

  private async startBoundWitness(): Promise<XyoZigZagBoundWitnessBuilder> {
    return new XyoZigZagBoundWitnessBuilder(this.signers, this.payload, this.boundWitnessSigningService)
  }
}
