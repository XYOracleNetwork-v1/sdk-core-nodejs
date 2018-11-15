/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th September 2018 3:52:12 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:15:05 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../../xyo-bound-witness/bound-witness/xyo-zig-zag-bound-witness';
import { CatalogueItem } from '../../xyo-network/xyo-catalogue-item';
import { XyoBoundWitnessTransfer } from '../../xyo-bound-witness/bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../../xyo-bound-witness/bound-witness/xyo-bound-witness';
import { XYO_TCP_CATALOGUE_LENGTH_IN_BYTES, XYO_TCP_CATALOGUE_SIZE_OF_SIZE_BYTES } from '../../xyo-network/tcp/xyo-tcp-network-constants';
import { XyoError, XyoErrors } from '../../xyo-core-components/xyo-error';
import { IXyoNodeInteraction, IXyoPayload } from '../../@types/xyo-node';
import { IXyoNetworkPipe } from '../../@types/xyo-network';
import { XyoBase } from '../../xyo-core-components/xyo-base';
import { IXyoSigner } from '../../@types/xyo-signing';

/**
 * An `XyoBoundWitnessInteraction` manages a "session"
 * between two networked nodes.
 */
export abstract class XyoBoundWitnessServerInteraction extends XyoBase implements IXyoNodeInteraction<XyoBoundWitness> {

  public abstract catalogueItem: CatalogueItem;

  constructor(
    private readonly signers: IXyoSigner[],
    private readonly payload: IXyoPayload
  ) {
    super();
  }

  /**
   * Does a bound witness with another node
   */

  public async run(networkPipe: IXyoNetworkPipe): Promise<XyoBoundWitness> {
    let disconnected = false;

    return new Promise(async (resolve, reject) => {
      /**
       * Listener for if and when the peer disconnects
       */
      const unregister = networkPipe.onPeerDisconnect(() => {
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
          const bytes = boundWitnessTransfer1.serialize(false);

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
            let response: Buffer | undefined;

            try {
              response = await networkPipe.send(bytesToSend);
            } catch (err) {
              this.logError(`Failed BoundWitnessTransfer on step 1`, err);
              return reject(err);
            }

            /** Deserialize bytes into bound witness  */
            const transferObj = XyoBoundWitnessTransfer.getSerializer<XyoBoundWitnessTransfer>().deserialize(response!);

            /** Add transfer to bound witness */
            const transfer = await boundWitness.incomingData(transferObj, false);

            if (!disconnected) {
              /** serialize the bound witness transfer */
              const transferBytes = transfer.serialize(false);

              try {
                await networkPipe.send(transferBytes, false);
              } catch (err) {
                this.logError(`Failed BoundWitnessTransfer on step 3`, err);
                return reject(err);
              }

              /** Stop listening for disconnect events */
              unregister();

              /** Close the connection */
              await networkPipe.close();

              /** Return the resulting bound-witness */
              return resolve(boundWitness);
            }
          }
        }
      }

      return reject(
        new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoErrors.CRITICAL)
      );
    }) as Promise<XyoBoundWitness>;
  }

  private async startBoundWitness(): Promise<XyoZigZagBoundWitness> {
    const boundWitness = new XyoZigZagBoundWitness(this.signers, this.payload);
    return boundWitness;
  }
}
