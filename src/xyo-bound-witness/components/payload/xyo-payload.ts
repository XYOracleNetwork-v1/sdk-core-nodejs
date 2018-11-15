/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 30th August 2018 3:00:16 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-payload.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../../../xyo-core-components/xyo-object';
import { getBufferHash } from '../../../xyo-core-components/xyo-buffer-utils';
import { XyoArray } from '../../../xyo-core-components/arrays/xyo-array';
import { IXyoObjectDescriptor } from '../../../@types/xyo-serialization';
import { IXyoPayload } from '../../../@types/xyo-node';

/**
 * An XyoPayload is meant to represent the meaningful data
 * in a bound witness interaction. It is broke into two important
 * parts, the `signedPayload` and the `unsignedPayload`.
 *
 * The signedPayload contains values that the signature
 * will take into consideration. The unsigned payload contains values
 * that do not have to be signed. This is useful for sharing data with
 * another node as part of a bound-witness, but that doesn't have to
 * be persisted in the origin chain for it to be considered valid.
 */

export class XyoPayload extends XyoObject implements IXyoPayload {

  public static major = 0x02;
  public static minor = 0x04;

  /**
   * Creates a new Instance of an XyoPayload
   *
   * @param signedPayload The part of the payload that will be signed
   * @param unsignedPayload The part of the payload that will be unsigned
   */

  constructor(public readonly signedPayload: XyoArray, public readonly unsignedPayload: XyoArray) {
    super(XyoPayload.major, XyoPayload.minor);
  }

  public getReadableName(): string {
    return 'payload';
  }

  public getReadableValue() {
    return {
      signedPayload: this.signedPayload,
      unsignedPayload: this.unsignedPayload
    };
  }

  /**
   * Returns a map where the keys are hash values and values are the values that hash to their
   * corresponding type id. This only takes into account the elements in the signed payload
   */

  get signedPayloadMapping () {
    return this.getMappingOfElements(this.signedPayload.array);
  }

  /** A helper for plucking a particular value out of the signed payload */
  public extractFromSignedPayload<T>(description: IXyoObjectDescriptor): T | undefined {
    return this.signedPayload.array.find((item) => {
      return item.major === description.major && item.minor === description.minor;
    }) as T | undefined;
  }

  /** A helper for plucking a particular value out of the unsigned payload */
  public extractFromUnsignedPayload<T>(description: IXyoObjectDescriptor): T | undefined {
    return this.unsignedPayload.array.find((item) => {
      return item.major === description.major && item.minor === description.minor;
    }) as T | undefined;
  }

  /**
   * A helper function that iterates through an array of
   * XyoObjects an creates map where the keys are hashes of the type id values
   * and the elements are the element themselves
   */

  private getMappingOfElements (objects: XyoObject[]): {[s: string]: XyoObject} {
    const mapping: {[s: string]: XyoObject} = {};

    objects.forEach((element) => {
      const bufferHash = getBufferHash(element.id);
      mapping[String(bufferHash)] = element;
    });

    return mapping;
  }
}
