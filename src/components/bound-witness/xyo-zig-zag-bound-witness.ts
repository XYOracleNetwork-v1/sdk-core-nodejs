/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 4th September 2018 9:00:49 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-zig-zag-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 5:55:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitness } from './xyo-bound-witness';
import { XyoPayload } from '../xyo-payload';
import { XyoSignatureSet } from '../arrays/xyo-signature-set';
import { XyoBoundWitnessTransfer } from './xyo-bound-witness-transfer';
import { XyoObject } from '../xyo-object';
import { XyoError } from '../xyo-error';
import { XyoKeySet } from '../arrays/xyo-key-set';
import { XyoPacker } from '../../xyo-packer/xyo-packer';
import { XyoSigner } from '../../signing/xyo-signer';
import { XyoPublicKey } from '../../signing/xyo-public-key';

/**
 * A `XyoZigZagBoundWitness` is a particular type of way of creating a
 * BoundWitness whereby the bound-witness is formed by passing discrete
 * sets of data to one another that ensures when the exchange is finished
 * all parties have the same data in their bound-witness.
 *
 * For a two party bound-witness where one party is A and the other party
 * is B.
 *
 * A will share data with B.
 * B, the endpoint, will sign the data from A and share data back with A.
 * A will then sign this data and send it back to B.
 * Once B has received the data back from A the two parties have all the
 * same pieces of information, with signatures, to form a bound-witness.
 */

export class XyoZigZagBoundWitness extends XyoBoundWitness {

  /**
   * The collection of payloads for all parties. One per party
   */

  private readonly dynamicPayloads: XyoPayload[] = [];

  /**
   * The set of public key sets for all parties. One per party.
   * But, each KeySet can have many keys if a party wants to
   * includes multiple public-key / signatures
   */

  private readonly dynamicPublicKeys: XyoKeySet[] = [];

  /**
   * The set of signatures for all parties.
   * As with the public keys, each party can have multiple signatures. The index of
   * a signature within a set should correspond to the index of same public key
   */

  private readonly dynamicSignatureSets: XyoSignatureSet[] = [];

  /** True if the key and payloads of this party have been added to the bound-witness */
  private hasSentKeysAndPayload = false;

  /**
   * Creates a new instance of an XyoZigZagBoundWitness
   * @param xyoPacker A packer to serialize / deserialize values
   * @param signers A set of signers to be able sign to provide crypto functionality
   * @param payload The payload that belongs to the party that is to be included in the BoundWitness
   */

  constructor (xyoPacker: XyoPacker, private readonly signers: XyoSigner[], private readonly payload: XyoPayload) {
    super(xyoPacker);
  }

  /**
   * The currents state of payloads for all parties involved in the bound-witness
   */

  get payloads () {
    return this.dynamicPayloads;
  }

  /**
   * The currents state of public keys for all parties involved in the bound-witness
   */

  get publicKeys() {
    return this.dynamicPublicKeys;
  }

  /**
   * The currents state of signatures for all parties involved in the bound-witness
   */

  get signatures() {
    return this.dynamicSignatureSets;
  }

  /**
   * When two or more parties exchange bound-witness data in a zig zag bound witness,
   * the other party must consume it and integrate it into their bound-witness. After
   * integrating it into their bound witness they may sign and possibly add their own
   * data to the bound witness and return the resulting bound-witness-transfer back
   *
   * @param transfer If this party is originating the bound witness, this value should be undefined.
   *                 Otherwise, it should be the current transfer value of the bound-witness
   *
   * @param endPoint In a zig zag bound witness the endpoint is the turn-around node. Thus, in a typical
   *                 zig-zag bound witness between `A` and `B`, where A begins the bound-witness, `B` is the endpoint
   */

  public async incomingData(transfer: XyoBoundWitnessTransfer | undefined, endPoint: boolean) {
    const keysToSend: XyoObject[] = [];
    const payloadsToSend: XyoObject[] = [];
    const signatureToSend: XyoObject[] = [];
    const signatureReceivedSize = (transfer && transfer.signatureToSend && transfer.signatureToSend.length) || 0;

    if (transfer) {
      this.addTransfer(transfer);
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

        for (let i = (this.signatures.length - signatureReceivedSize) - 1; i >= 0; i -= 1) {
          signatureToSend.push(this.signatures[i]);
        }
      }
    }

    return new XyoBoundWitnessTransfer(keysToSend, payloadsToSend, signatureToSend);
  }

  /**
   * A helper function to integrate existing transfer data into the bound-witness
   */

  private addTransfer(transfer: XyoBoundWitnessTransfer) {
    this.addIncomingKeys(transfer.keysToSend);
    this.addIncomingPayload(transfer.payloadsToSend);
    this.addIncomingSignatures(transfer.signatureToSend);
  }

  /**
   * Adds other parties public keys into the bound-witness
   */

  private addIncomingKeys(incomingKeySets: XyoObject[]) {
    for (const obj of incomingKeySets) {
      const incomingKeySet = obj as XyoKeySet;
      if (incomingKeySet) {
        this.dynamicPublicKeys.push(incomingKeySet);
      } else {
        throw new XyoError(`Error unpacking keyset`, XyoError.errorType.ERR_CRITICAL);
      }
    }
  }

  /**
   * Adds other parties payloads into the bound-witness
   */

  private addIncomingPayload(incomingPayloads: XyoObject[]) {
    for (const obj of incomingPayloads) {
      const incomingPayload = obj as XyoPayload;
      if (incomingPayload) {
        this.dynamicPayloads.push(incomingPayload);
      } else {
        throw new XyoError(`Error unpacking payload`, XyoError.errorType.ERR_CRITICAL);
      }
    }
  }

  /**
   * Adds other parties signatures into the bound-witness
   */

  private addIncomingSignatures(incomingSignatures: XyoObject[]) {
    for (const obj of incomingSignatures) {
      const incomingSignatureSet = obj as XyoSignatureSet;
      if (incomingSignatureSet) {
        this.dynamicSignatureSets.unshift(incomingSignatureSet);
      } else {
        throw new XyoError(`Error unpacking signatureSet`, XyoError.errorType.ERR_CRITICAL);
      }
    }
  }

  /**
   * Adds the owner of this Bound-Witness public-keys to the bound-witness
   */

  private makeSelfKeySet(): XyoKeySet {
    const publicKeys: XyoPublicKey[] = [];

    this.signers.forEach((signer) => {
      const publicKey = signer.publicKey;

      const publicKeyValue = publicKey;

      if (publicKeyValue) {
        publicKeys.push(publicKeyValue);
      }
    });

    return new XyoKeySet(publicKeys);
  }

  /**
   * Creates the signature set for this party and adds its to the bound-witness's
   * signatures
   */

  private async signForSelf() {
    const signatureSet = await this.signBoundWitness();
    this.dynamicSignatureSets.unshift(signatureSet);
  }

  /**
   * For each signer that belongs to the owner of this bound-witness, this
   * will create a signature for the particular signing algorithm.
   */

  private async signBoundWitness() {
    const promises = this.signers.map(async (signer) => {
      const signature = await this.signCurrent(signer);
      return signature;
    }) as Promise<XyoObject>[]; // tslint:disable-line:array-type

    const signersCollection = await Promise.all(promises);
    return new XyoSignatureSet(signersCollection);
  }
}
