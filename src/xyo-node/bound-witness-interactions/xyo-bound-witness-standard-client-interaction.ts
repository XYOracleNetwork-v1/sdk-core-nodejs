/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 27th September 2018 9:48:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-client-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 1:18:07 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoZigZagBoundWitness } from '../../xyo-bound-witness/bound-witness/xyo-zig-zag-bound-witness';
import { XyoBoundWitnessTransfer } from '../../xyo-bound-witness/bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../../xyo-bound-witness/bound-witness/xyo-bound-witness';
import { XyoError } from '../../xyo-core-components/xyo-error';
import { IXyoNodeInteraction } from '../../@types/xyo-node';
import { IXyoNetworkPipe } from '../../@types/xyo-network';
import { XyoBase } from '../../xyo-core-components/xyo-base';
import { XyoPacker } from '../../xyo-serialization/xyo-packer';
import { IXyoSigner } from '../../@types/xyo-signing';
import { XyoPayload } from '../../xyo-bound-witness/components/payload/xyo-payload';

/**
 * An `XyoBoundWitnessClientInteraction` manages a "session"
 * between two networked nodes.
 */

export class XyoBoundWitnessStandardClientInteraction extends XyoBase implements IXyoNodeInteraction<XyoBoundWitness> {

  constructor (
    private readonly packer: XyoPacker,
    private readonly signers: IXyoSigner[],
    private readonly payload: XyoPayload
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
          const boundWitnessTransferSerializer = this.packer.getSerializerByDescriptor(XyoBoundWitnessTransfer);
          const boundWitnessTransfer1 = boundWitnessTransferSerializer.deserialize(
            networkPipe.initiationData!, this.packer
          );

          const boundWitnessTransfer2 = await boundWitness.incomingData(boundWitnessTransfer1, true);

          /** Serialize the transfer value */
          const bytes = this.packer.serialize(boundWitnessTransfer2, false);

          if (!disconnected) {
            /* Send the message and wait for reply */
            this.logInfo(`Sending bound witness message`);
            const response = await networkPipe.send(bytes);
            this.logInfo(`Received bound witness response`);

            /** Deserialize bytes into bound witness  */
            const transferObj = boundWitnessTransferSerializer.deserialize(response!, this.packer);

            /** Add transfer to bound witness */
            await boundWitness.incomingData(transferObj, false);

            /** Stop listening for disconnect events */
            unregister();

            /** Close the connection */
            await networkPipe.close();

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
    return new XyoZigZagBoundWitness(this.packer, this.signers, this.payload);
  }
}
