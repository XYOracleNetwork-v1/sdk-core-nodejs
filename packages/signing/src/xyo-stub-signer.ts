/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:40:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-stub-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:29:32 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSigner, IXyoPublicKey, IXyoSignature } from "./@types"

export class XyoStubSigner implements IXyoSigner {

  constructor (
    public readonly publicKey: IXyoPublicKey,
    public readonly signature: IXyoSignature
  ) {}

  get privateKey () {
    return 'abc'
  }

  public async signData(data: Buffer): Promise<IXyoSignature> {
    return this.signature
  }
}
