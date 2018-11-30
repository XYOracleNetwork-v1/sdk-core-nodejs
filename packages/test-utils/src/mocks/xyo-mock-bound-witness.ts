/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:34:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 4:37:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'

export class XyoMockBoundWitness extends XyoBaseBoundWitness {
  constructor (
    public readonly publicKeys: IXyoPublicKey[][],
    public readonly signatures: IXyoSignature[][],
    public readonly payloads: IXyoPayload[]
  ) {
    super()
  }
}
