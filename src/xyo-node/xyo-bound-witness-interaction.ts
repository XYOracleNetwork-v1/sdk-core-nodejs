/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 3:52:12 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 5:10:17 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../components/bound-witness/xyo-zig-zag-bound-witness';
import { XyoPayload } from '../components/xyo-payload';
import { CatalogueItem } from '../network/xyo-catalogue-item';
import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoBoundWitnessTransfer } from '../components/bound-witness/xyo-bound-witness-transfer';
import { XyoSigner } from '../components/signing/xyo-signer';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XYO_TCP_CATALOGUE_LENGTH_IN_BYTES, XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES } from '../network/tcp-network/xyo-tcp-network-constants';
import { XyoError } from '../components/xyo-error';
import { XyoPacker } from '../xyo-packer/xyo-packer';

const logger = console;

/**
 * An `XyoBoundWitnessInteraction` manages a "session"
 * between two networked nodes.
 */
export class XyoBoundWitnessInteraction {

  /**
   * Creates a new instance of a `XyoBoundWitnessInteraction`
   * @param xyoPacker A packer for serializing and deserializing values
   * @param networkPipe A pipe to communicate with a peers
   * @param signers The signers to use for the bound witness
   * @param payload The payload to embed in the bound witness
   */

  constructor (
    private readonly xyoPacker: XyoPacker,
    private readonly networkPipe: XyoNetworkPipe,
    private readonly signers: XyoSigner[],
    private readonly payload: XyoPayload
  ) {}

  /**
   * Does a bound witness with another node
   */
  public async run(): Promise<XyoBoundWitness> {
    let disconnected = false;

    return new Promise(async (resolve, reject) => {
      /**
       * Listener for if and when the peer disconnects
       */
      const unregister = this.networkPipe.onPeerDisconnect(() => {
        disconnected = true;
        logger.info(`Peer disconnected in xyo-bound-witness-interaction`);
      });

      logger.info(`Starting bound witness`);

      if (!disconnected) {
        // Create the bound witness
        const boundWitness = await this.startBoundWitness();
        if (!disconnected) {
          /** Do step 1 of the bound witness */
          const boundWitnessTransfer1 = await boundWitness.incomingData(undefined, false);

          /** Serialize the transfer value */
          const bytes = this.xyoPacker.serialize(
            boundWitnessTransfer1,
            boundWitnessTransfer1.id[0],
            boundWitnessTransfer1.id[1],
            false
          );

          /** Tell the other node this is the catalogue item you chose */
          const catalogueBuffer = new Buffer(XYO_TCP_CATALOGUE_LENGTH_IN_BYTES);
          catalogueBuffer.writeUInt32BE(CatalogueItem.BOUND_WITNESS, 0);
          const sizeOfCatalogueInBytesBuffers = new Buffer(XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES);
          sizeOfCatalogueInBytesBuffers.writeUInt8(XYO_TCP_CATALOGUE_LENGTH_IN_BYTES, 0);

          /** Build the final message */
          const bytesToSend = Buffer.concat([
            sizeOfCatalogueInBytesBuffers,
            catalogueBuffer,
            bytes
          ]);

          if (!disconnected) {
            /* Send the message and wait for reply */
            const response = await this.networkPipe.send(bytesToSend);

            /** Deserialize bytes into bound witness  */
            const transferObj = this.xyoPacker.getSerializerByName(XyoBoundWitnessTransfer.name)
              .deserialize(response!, this.xyoPacker);

            /** Add transfer to bound witness */
            const transfer = await boundWitness.incomingData(transferObj, false);

            if (!disconnected) {
              /** serialize the bound witness transfer */
              const transferBytes = this.xyoPacker.getSerializerByName(XyoBoundWitnessTransfer.name)
                .serialize(transfer, this.xyoPacker);

              /** Send transfer data, but dont wait for reply */
              await this.networkPipe.send(transferBytes, false);

              /** Stop listening for disconnect events */
              unregister();

              /** Close the connection */
              await this.networkPipe.close();

              /** Return the resulting bound-witness */
              return resolve(boundWitness);
            }
          }
        }
      }

      return reject(
        new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoError.errorType.ERR_CRITICAL)
      );
    }) as Promise<XyoBoundWitness>;
  }

  private async startBoundWitness(): Promise<XyoZigZagBoundWitness> {
    const boundWitness = new XyoZigZagBoundWitness(this.xyoPacker, this.signers, this.payload);
    return boundWitness;
  }
}
