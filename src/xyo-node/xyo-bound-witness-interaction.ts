/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 27th September 2018 12:49:08 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 6:23:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoNodeInteraction } from './xyo-node-types';
import { XyoBase } from '../components/xyo-base';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoPacker } from '../xyo-packer/xyo-packer';
import { XyoNetworkPipe } from '../network/xyo-network';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoPayload } from '../components/xyo-payload';

export abstract class XyoBoundWitnessInteraction extends XyoBase implements XyoNodeInteraction<XyoBoundWitness> {

  constructor(
    protected readonly xyoPacker: XyoPacker,
    protected readonly networkPipe: XyoNetworkPipe,
    protected readonly signers: XyoSigner[],
    protected readonly payload: XyoPayload
  ) {
    super();
  }

  public abstract run(): Promise<XyoBoundWitness>;
}
