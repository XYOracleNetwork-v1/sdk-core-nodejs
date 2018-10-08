/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 3:52:12 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:44:37 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../components/bound-witness/xyo-zig-zag-bound-witness';
import { CatalogueItem } from '../network/xyo-catalogue-item';
import { XyoBoundWitnessTransfer } from '../components/bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XYO_TCP_CATALOGUE_LENGTH_IN_BYTES, XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES } from '../network/tcp-network/xyo-tcp-network-constants';
import { XyoError } from '../components/xyo-error';
import { XyoBoundWitnessInteraction } from './xyo-bound-witness-interaction';

/**
 * An `XyoBoundWitnessInteraction` manages a "session"
 * between two networked nodes.
 */
export abstract class XyoBoundWitnessServerInteraction extends XyoBoundWitnessInteraction {

  public abstract catalogueItem: CatalogueItem;

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
        this.logInfo(`Peer disconnected in xyo-bound-witness-interaction`);
      });

      this.logInfo(`Starting bound witness`);

      if (!disconnected) {
        // Create the bound witness
        const boundWitness = await this.startBoundWitness();
        if (!disconnected) {
          /** Do step 1 of the bound witness */
          const boundWitnessTransfer1 = await boundWitness.incomingData(undefined, false);

          /** Serialize the transfer value */
          const bytes = this.xyoPacker.serialize(boundWitnessTransfer1, false);

          /** Tell the other node this is the catalogue item you chose */
          const catalogueBuffer = Buffer.alloc(XYO_TCP_CATALOGUE_LENGTH_IN_BYTES);
          catalogueBuffer.writeUInt32BE(this.catalogueItem, 0);
          const sizeOfCatalogueInBytesBuffers = Buffer.alloc(XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES);
          sizeOfCatalogueInBytesBuffers.writeUInt8(XYO_TCP_CATALOGUE_LENGTH_IN_BYTES, 0);

          /** Build the final message */
          const bytesToSend = Buffer.concat([
            sizeOfCatalogueInBytesBuffers,
            catalogueBuffer,
            bytes
          ]);

          if (!disconnected) {
            /* Send the message and wait for reply */
            this.logInfo(`Sending BoundWitnessTransfer 1`);
            const response = await this.networkPipe.send(bytesToSend);
            this.logInfo(`Received BoundWitnessTransfer 2`, response!.toString('hex'));

            /** Deserialize bytes into bound witness  */
            const transferObj = this.xyoPacker.getSerializerByDescriptor(XyoBoundWitnessTransfer)
              .deserialize(response!, this.xyoPacker);

            /** Add transfer to bound witness */
            const transfer = await boundWitness.incomingData(transferObj, false);

            if (!disconnected) {
              /** serialize the bound witness transfer */
              const transferBytes = this.xyoPacker.serialize(transfer, false);

              /** Send transfer data, but dont wait for reply */
              this.logInfo(`Sending final Transfer 3. Will disconnect`);
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
