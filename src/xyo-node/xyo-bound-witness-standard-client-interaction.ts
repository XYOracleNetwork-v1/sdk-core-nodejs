/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 27th September 2018 9:48:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-client-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:44:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../components/bound-witness/xyo-zig-zag-bound-witness';
import { XyoBoundWitnessTransfer } from '../components/bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoError } from '../components/xyo-error';
import { XyoBoundWitnessInteraction } from './xyo-bound-witness-interaction';

/**
 * An `XyoBoundWitnessClientInteraction` manages a "session"
 * between two networked nodes.
 */

export class XyoBoundWitnessStandardClientInteraction extends XyoBoundWitnessInteraction {

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
          const boundWitnessTransferSerializer = this.xyoPacker.getSerializerByDescriptor(XyoBoundWitnessTransfer);
          const boundWitnessTransfer1 = boundWitnessTransferSerializer.deserialize(
            this.networkPipe.initiationData!, this.xyoPacker
          );

          const boundWitnessTransfer2 = await boundWitness.incomingData(boundWitnessTransfer1, true);

          /** Serialize the transfer value */
          const bytes = this.xyoPacker.serialize(boundWitnessTransfer2, false);

          if (!disconnected) {
            /* Send the message and wait for reply */
            this.logInfo(`Sending bound witness message`);
            const response = await this.networkPipe.send(bytes);
            this.logInfo(`Received bound witness response`);

            /** Deserialize bytes into bound witness  */
            const transferObj = boundWitnessTransferSerializer.deserialize(response!, this.xyoPacker);

            /** Add transfer to bound witness */
            await boundWitness.incomingData(transferObj, false);

            /** Stop listening for disconnect events */
            unregister();

            /** Close the connection */
            await this.networkPipe.close();

            /** Return the resulting bound-witness */
            return resolve(boundWitness);
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
