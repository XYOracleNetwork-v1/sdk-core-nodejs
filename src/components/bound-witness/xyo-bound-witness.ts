/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 31st August 2018 11:37:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 18th September 2018 3:40:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-object';
import { XyoPayload } from '../xyo-payload';
import { XyoSignatureSet } from '../arrays/xyo-signature-set';
import { XyoError } from '../xyo-error';
import { XyoHash } from '../hashing/xyo-hash';
import { XyoKeySet } from '../arrays/xyo-key-set';
import { XyoHashProvider } from '../../hash-provider/xyo-hash-provider';
import { XyoPacker } from '../../xyo-packer/xyo-packer';
import { XyoSingleTypeArrayShort } from '../arrays/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../arrays/xyo-single-type-array-int';
import { XyoSigner } from '../../signing/xyo-signer';

/**
 * An XyoBoundWitness is one of the core pieces in the XYO protocol.
 * It cryptographically proves that two (or more) parties interacted.
 * Additionally other metadata can go into Bound Witness suggesting that
 * both parties agree to a version of reality constituted by set of attributes.
 *
 * The bound-witness protocol is tightly coupled with the xyo-packing scheme.
 *
 * @major 0x02
 * @minor 0x01
 */

export abstract class XyoBoundWitness extends XyoObject {

  /** The public keys that are part of the bound-witness */
  public abstract publicKeys: XyoKeySet[];

  /** The payloads, broken into signed and unsigned that is part of the bound witness */
  public abstract payloads: XyoPayload[];

  /** The signatures from the parties involved that are part of the bound witness */
  public abstract signatures: XyoSignatureSet[];

  /**
   * Creates a new instance of an XyoBoundWitness
   *
   * @param xyoPacker A packer for serializing/deserializing values.
   */

  constructor (private readonly xyoPacker: XyoPacker) {
    super(0x02, 0x01);
  }

  /**
   * Gets a hash of the data that is to be signed
   *
   * @param hashProvider A hash provider to be used for calculating the hash
   */

  public async getHash (hashProvider: XyoHashProvider): Promise<XyoHash> {
    const dataToHashValue = this.getSigningData();
    return hashProvider.createHash(dataToHashValue);
  }

  /**
   * Gets the untyped packed representation of current public keys of the bound-witness
   *
   * The public keys are represented as a `XyoSingleTypeArrayShort` with a major and minor
   * values of `0x01` and `0x02` respectively
   */

  public makePublicKeysUntyped(): Buffer {
    const { major, minor } = this.getPublicKeysMajorMinor();
    const publicKeys = new XyoSingleTypeArrayShort(major, minor, this.publicKeys);

    return this.xyoPacker.serialize(publicKeys, publicKeys.major, publicKeys.minor, false);
  }

  /**
   * Gets the untyped packed representation of current signatures of the bound-witness
   *
   * The signatures are represented as a `XyoSingleTypeArrayShort` with a major and minor
   * values of `0x02` and `0x03` respectively
   */

  public makeSignaturesUntyped(): Buffer {
    const { major, minor } =  this.getSignaturesMajorMinor();
    const signatures = new XyoSingleTypeArrayShort(major, minor, this.signatures);
    return this.xyoPacker.serialize(signatures, signatures.major, signatures.minor, false);
  }

  /**
   * Gets the untyped packed representation of current payloads of the bound-witness
   *
   * The signatures are represented as a `XyoSingleTypeArrayInt` with a major and minor
   * values of `0x02` and `0x04` respectively
   */

  public makePayloadsUntyped(): Buffer {
    const { major, minor } =  this.getPayloadsMajorMinor();

    const payloads = new XyoSingleTypeArrayInt(major, minor, this.payloads);
    return this.xyoPacker.serialize(payloads, payloads.major, payloads.minor, false);
  }

  /**
   * Calculates a signature based on the current state of the bound-witness
   * @param signer A signer object used to get the signature
   */

  protected async signCurrent(signer: XyoSigner) {
    return signer.signData(this.getSigningData());
  }

  /**
   * Packs the relevant signing data into Buffer. This includes public keys and
   * the signed portion of the payload
   */

  private getSigningData (): Buffer {
    const collection: Buffer[] = [];
    const publicKeysUntyped = this.makePublicKeysUntyped();
    collection.push(publicKeysUntyped);

    for (const payload of this.payloads) {
      if (!payload) {
        throw new XyoError(`Payload can't be null`, XyoError.errorType.ERR_CREATOR_MAPPING);
      }
      const payloadData = payload.signedPayload;
      collection.push(this.xyoPacker.serialize(payloadData, payloadData.major, payloadData.minor, false));
    }

    return Buffer.concat(collection);
  }

  /**
   * A helper function get the major and minor values for public keys
   */

  private getPublicKeysMajorMinor() {
    return this.xyoPacker.getMajorMinor(XyoKeySet.name);
  }

  /**
   * A helper function get the major and minor values for signatures
   */

  private getSignaturesMajorMinor() {
    return this.xyoPacker.getMajorMinor(XyoSignatureSet.name);
  }

  /**
   * A helper function get the major and minor values for payloads
   */

  private getPayloadsMajorMinor() {
    return this.xyoPacker.getMajorMinor(XyoPayload.name);
  }
}
