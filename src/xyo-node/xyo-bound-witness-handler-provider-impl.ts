/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:31:36 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 4:44:46 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoHashProvider } from '../hash-provider/xyo-hash-provider';
import { extractNestedBoundWitnesses } from './bound-witness-origin-chain-extractor';
import { XyoBoundWitnessHandlerProvider, XyoBoundWitnessPayloadProvider, XyoBoundWitnessSuccessListener, XyoBoundWitnessInteractionFactory } from './xyo-node-types';
import { XyoOriginBlockRepository, XyoOriginChainStateRepository } from '../origin-chain/xyo-origin-chain-types';
import { XyoBase } from '../components/xyo-base';

export class XyoBoundWitnessHandlerProviderImpl extends XyoBase implements XyoBoundWitnessHandlerProvider {

  constructor (
    private readonly xyoPacker: XyoPacker,
    private readonly hashingProvider: XyoHashProvider,
    private readonly originState: XyoOriginChainStateRepository,
    private readonly originChainNavigator: XyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: XyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: XyoBoundWitnessSuccessListener,
    private readonly boundWitnessInteractionFactory: XyoBoundWitnessInteractionFactory
  ) {
    super();
  }

  public async handle(networkPipe: XyoNetworkPipe): Promise<XyoBoundWitness> {
    const [payload, signers] = await Promise.all([
      this.boundWitnessPayloadProvider.getPayload(this.originState),
      this.originState.getSigners()
    ]);

    const interaction = this.boundWitnessInteractionFactory.newInstance(
      this.xyoPacker,
      networkPipe,
      signers,
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
      const nestedHash = this.xyoPacker.serialize(nestedHashValue, true);
      this.logInfo(`Extracted nested block with hash ${nestedHash.toString('hex')}`);
      return this.originChainNavigator.addOriginBlock(nestedHashValue, nestedBoundWitness);
    }));

    if (this.boundWitnessSuccessListener) {
      await this.boundWitnessSuccessListener.onBoundWitnessSuccess(boundWitness);
    }

    return;
  }
}
