/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 19th October 2018 12:34:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-genesis-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 19th October 2018 12:46:11 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from "./xyo-bound-witness";
import { XyoPayload } from "../components/payload/xyo-payload";
import { XyoKeySet } from "../components/key-set/xyo-key-set";
import { XyoSignatureSet } from "../components/signature-set/xyo-signature-set";
import { XyoObject } from "../../xyo-core-components/xyo-object";
import { IXyoSigner, IXyoPublicKey } from "../../@types/xyo-signing";

export class XyoGenesisBoundWitness extends XyoBoundWitness {
  /** The public keys that are part of the bound-witness */
  public readonly publicKeys: XyoKeySet[] = [];

  /** The payloads, broken into signed and unsigned that is part of the bound witness */
  public readonly payloads: XyoPayload[];

  /** The signatures from the parties involved that are part of the bound witness */
  public readonly signatures: XyoSignatureSet[] = [];

  constructor(private readonly signers: IXyoSigner[], payload: XyoPayload) {
    super();
    this.payloads = [payload];
  }

  public async createGenesisBlock() {
    const publicKeys: IXyoPublicKey[] = [];
    const promises = this.signers.map(async (signer) => {
      publicKeys.push(signer.publicKey);
      const signature = await this.signCurrent(signer);
      return signature;
    }) as Promise<XyoObject>[]; // tslint:disable-line:array-type

    const signersCollection = await Promise.all(promises);
    this.publicKeys.push(new XyoKeySet(publicKeys));
    this.signatures.push(new XyoSignatureSet(signersCollection));
  }
}
