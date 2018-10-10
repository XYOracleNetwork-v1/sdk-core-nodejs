/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th September 2018 8:31:36 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-bound-witness-handler-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 1:19:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPacker } from '../xyo-serialization/xyo-packer';
import { IXyoNetworkPipe } from '../@types/xyo-network';
import { XyoBoundWitness } from '../xyo-bound-witness/bound-witness/xyo-bound-witness';
import { IXyoHashProvider } from '../@types/xyo-hashing';
import { extractNestedBoundWitnesses } from '../xyo-bound-witness/bound-witness/xyo-bound-witness-origin-chain-extractor';
import { IXyoBoundWitnessHandlerProvider, IXyoBoundWitnessPayloadProvider, IXyoBoundWitnessSuccessListener, IXyoBoundWitnessInteractionFactory } from '../@types/xyo-node';
import { IXyoOriginBlockRepository, IXyoOriginChainStateRepository } from '../@types/xyo-origin-chain';
import { XyoBase } from '../xyo-core-components/xyo-base';

export class XyoBoundWitnessHandlerProvider extends XyoBase implements IXyoBoundWitnessHandlerProvider {

  constructor (
    private readonly xyoPacker: XyoPacker,
    private readonly hashingProvider: IXyoHashProvider,
    private readonly originState: IXyoOriginChainStateRepository,
    private readonly originChainNavigator: IXyoOriginBlockRepository,
    private readonly boundWitnessPayloadProvider: IXyoBoundWitnessPayloadProvider,
    private readonly boundWitnessSuccessListener: IXyoBoundWitnessSuccessListener,
    private readonly boundWitnessInteractionFactory: IXyoBoundWitnessInteractionFactory
  ) {
    super();
  }

  public async handle(networkPipe: IXyoNetworkPipe): Promise<XyoBoundWitness> {
    const [payload, signers] = await Promise.all([
      this.boundWitnessPayloadProvider.getPayload(this.originState),
      this.originState.getSigners()
    ]);

    const interaction = this.boundWitnessInteractionFactory.newInstance(signers, payload);

    const boundWitness = await interaction.run(networkPipe);
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
