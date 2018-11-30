/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:40:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-mock-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 4:41:24 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSigner, IXyoPublicKey, IXyoSignature } from "@xyo-network/signing"

export class XyoMockSigner implements IXyoSigner {

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
