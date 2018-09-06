/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 4th September 2018 9:00:49 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-zig-zag-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 4th September 2018 3:11:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from './xyo-bound-witness';
import { XyoSigner } from '../signing/xyo-signer';
import { XyoPayload } from '../xyo-payload';
import { XyoKeySet } from '../arrays/multi/xyo-key-set';
import { XyoSignatureSet } from '../arrays/multi/xyo-signature-set';
import { XyoBoundWitnessTransfer } from './xyo-bound-witness-transfer';
import { XyoObject } from '../xyo-object';
import { XyoResult } from '../xyo-result';
import { XyoError } from '../xyo-error';

export class XyoZigZagBoundWitness extends XyoBoundWitness {

  private readonly dynamicPayloads: XyoPayload[] = [];
  private readonly dynamicPublicKeys: XyoKeySet[] = [];
  private readonly dynamicSignatureSets: XyoSignatureSet[] = [];
  private hasSentKeysAndPayload = false;

  constructor (
    private readonly signers: XyoSigner[],
    private readonly payload: XyoPayload
  ) {
    super();
  }

  get payloads () {
    return this.dynamicPayloads;
  }

  get publicKeys() {
    return this.dynamicPublicKeys;
  }

  get signatures() {
    return this.dynamicSignatureSets;
  }

  public async incomingData(transfer: XyoBoundWitnessTransfer | null, endPoint: boolean) {
    const keysToSend: XyoObject[] = [];
    const payloadsToSend: XyoObject[] = [];
    const signatureToSend: XyoObject[] = [];
    const signatureReceivedSize = (transfer && transfer.signatureToSend && transfer.signatureToSend.length) || 0;

    if (transfer !== null) {
      await this.addTransfer(transfer);
    }

    if (!this.hasSentKeysAndPayload) {
      this.dynamicPublicKeys.push(this.makeSelfKeySet());
      this.dynamicPayloads.push(this.payload);
      this.hasSentKeysAndPayload = true;
    }

    if (this.signatures.length !== this.publicKeys.length) {
      if (this.signatures.length === 0 && !endPoint) {
        this.publicKeys.forEach(key => keysToSend.push(key));
        this.payloads.forEach(payload => payloadsToSend.push(payload));
      } else {
        await this.signForSelf();

        for (let i = signatureReceivedSize + 1; i < this.publicKeys.length; i += 1) {
          keysToSend.push(this.publicKeys[i]);
        }

        for (let i = signatureReceivedSize + 1; i < this.payloads.length; i += 1) {
          payloadsToSend.push(this.payloads[i]);
        }

        for (let i = signatureReceivedSize; i < this.signatures.length; i += 1) {
          signatureToSend.push(this.signatures[i]);
        }
      }
    }

    return XyoResult.withValue(
      new XyoBoundWitnessTransfer(keysToSend, payloadsToSend, signatureToSend)
    );
  }

  private addTransfer(transfer: XyoBoundWitnessTransfer): XyoResult<XyoBoundWitnessTransfer> | null {
    const keyError = this.addIncomingKeys(transfer.keysToSend);

    if (keyError) {
      return XyoResult.withError(keyError);
    }

    const payloadError = this.addIncomingPayload(transfer.payloadsToSend);
    if (payloadError) {
      return XyoResult.withError(payloadError);
    }

    const signatureError = this.addIncomingSignatures(transfer.signatureToSend);
    if (signatureError) {
      return XyoResult.withError(signatureError);
    }

    return null;
  }

  private addIncomingKeys(incomingKeySets: XyoObject[]): XyoError | null {
    for (const obj of incomingKeySets) {
      const incomingKeySet = obj as XyoKeySet;
      if (incomingKeySet) {
        this.dynamicPublicKeys.push(incomingKeySet);
      } else {
        return new XyoError(`Error unpacking keyset`, XyoError.errorType.ERR_CRITICAL);
      }
    }

    return null;
  }

  private addIncomingPayload(incomingPayloads: XyoObject[]): XyoError | null {
    for (const obj of incomingPayloads) {
      const incomingPayload = obj as XyoPayload;
      if (incomingPayload) {
        this.dynamicPayloads.push(incomingPayload);
      } else {
        return new XyoError(`Error unpacking payload`, XyoError.errorType.ERR_CRITICAL);
      }
    }

    return null;
  }

  private addIncomingSignatures(incomingSignatures: XyoObject[]): XyoError | null {
    for (const obj of incomingSignatures) {
      const incomingSignatureSet = obj as XyoSignatureSet;
      if (incomingSignatureSet) {
        this.dynamicSignatureSets.push(incomingSignatureSet);
      } else {
        return new XyoError(`Error unpacking signatureSet`, XyoError.errorType.ERR_CRITICAL);
      }
    }

    return null;
  }

  private makeSelfKeySet(): XyoKeySet {
    const publicKeys: XyoObject[] = [];

    this.signers.forEach((signer) => {
      const publicKey = signer.publicKey;

      const publicKeyValue = publicKey.value;

      if (publicKeyValue) {
        publicKeys.push(publicKeyValue);
      }
    });

    return new XyoKeySet(publicKeys);
  }

  private async signForSelf(): Promise<XyoError | null> {
    const signatureSet = await this.signBoundWitness();
    if (!signatureSet.hasError()) {
      this.dynamicSignatureSets.push(signatureSet.value!);
      return null;
    }

    return signatureSet.error!;
  }

  private async signBoundWitness() {
    const promises = this.signers.map(async (signer) => {
      const signature = await this.signCurrent(signer);
      return signature.value!;
    }) as Promise<XyoObject>[]; // tslint:disable-line:array-type

    const signersCollection = await Promise.all(promises);
    const signatureSet = new XyoSignatureSet(signersCollection);
    return XyoResult.withValue(signatureSet);
  }
}
