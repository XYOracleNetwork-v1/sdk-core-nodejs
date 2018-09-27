/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:31:36 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 27th September 2018 11:11:29 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoBoundWitnessServerInteraction } from './xyo-bound-witness-server-interaction';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoHashProvider } from '../hash-provider/xyo-hash-provider';
import { extractNestedBoundWitnesses } from './bound-witness-origin-chain-extractor';
import { XyoBoundWitnessHandlerProvider, XyoBoundWitnessPayloadProvider, XyoBoundWitnessSuccessListener } from './xyo-node-types';
import { XyoOriginBlockRepository, XyoOriginChainStateRepository } from '../origin-chain/xyo-origin-chain-types';
import { XyoBase } from '../components/xyo-base';

export class XyoBoundWitnessHandlerProviderImpl extends XyoBase implements XyoBoundWitnessHandlerProvider {

  constructor (
    private readonly xyoPacker: XyoPacker,
    private readonly signers: XyoSigner[],
    private readonly hashingProvider: XyoHashProvider,
    private readonly originState: XyoOriginChainStateRepository,
    private readonly originChainNavigator: XyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: XyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: XyoBoundWitnessSuccessListener
  ) {
    super();
  }

  public async handle(networkPipe: XyoNetworkPipe): Promise<XyoBoundWitness> {
    const payload = await this.boundWitnessPayloadProvider.getPayload(this.originState);

    const interaction = new XyoBoundWitnessServerInteraction(
      this.xyoPacker,
      networkPipe,
      this.signers,
      payload
    );

    const boundWitness = await interaction.run();
    await this.handleBoundWitnessSuccess(boundWitness);
    return boundWitness;
  }

  /**
   * A helper function for processing successful bound witnesses
   */

  private async handleBoundWitnessSuccess(boundWitness: XyoBoundWitness): Promise<void> {
    const hashValue = await boundWitness.getHash(this.hashingProvider);

    await this.originState.updateOriginChainState(hashValue);
    await this.originChainNavigator.addOriginBlock(hashValue, boundWitness);
    const nestedBoundWitnesses = extractNestedBoundWitnesses(boundWitness, this.xyoPacker);

    await Promise.all(nestedBoundWitnesses.map(async (nestedBoundWitness) => {
      const nestedHashValue = await nestedBoundWitness.getHash(this.hashingProvider);
      return this.originChainNavigator.addOriginBlock(nestedHashValue, nestedBoundWitness);
    }));

    if (this.boundWitnessSuccessListener) {
      await this.boundWitnessSuccessListener.onBoundWitnessSuccess(boundWitness);
    }

    return;
  }
}
