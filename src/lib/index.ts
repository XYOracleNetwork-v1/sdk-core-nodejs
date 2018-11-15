/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 10th October 2018 2:09:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 14th November 2018 4:23:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from '../xyo-core-components/xyo-object';
import { XyoDefaultPackerProvider } from '../xyo-serialization/xyo-default-packer-provider';

/**
 * Initializes the library runtime with serialization/deserialization set
 */

XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();

// re-export everything that is in the exports file
export * from './exports';

import { XyoError, XyoErrors } from '../xyo-core-components/xyo-error';
import { XyoSha256HashProvider } from '../xyo-hashing/sha256/xyo-sha256-hash-provider';
import { XyoSha512HashProvider } from '../xyo-hashing/sha512/xyo-sha512-hash-provider';
import { XyoMd5HashProvider } from '../xyo-hashing/md5/xyo-md5-hash-provider';
import { XyoSha1HashProvider } from '../xyo-hashing/sha1/xyo-sha1-hash-provider';
import { XyoSha224HashProvider } from '../xyo-hashing/sha224/xyo-sha224-hash-provider';
import { XyoPayload } from '../xyo-bound-witness/components/payload/xyo-payload';
import { XyoMultiTypeArrayInt } from '../xyo-core-components/arrays/multi/xyo-multi-type-array-int';
import { IXyoPayload } from '../@types/xyo-node';
import { IXyoHashProvider } from '../@types/xyo-hashing';

/**
 * The currently natively supported hash-types in the XYO protocol
 */
export type HASH_TYPE = 'sha256' | 'sha512' | 'md5' | 'sha1' | 'sha224';

/** A cache fro the hash-providers */
const hashProvidersByType: {[h: string]: IXyoHashProvider } = {};

/**
 * Gets a HashProvider given a hashType
 *
 * @export
 * @param {HASH_TYPE} hashType 'sha256' | 'sha512' | 'md5' | 'sha1' | 'sha224'
 * @returns {IXyoHashProvider} An instance of a `IXyoHashProvider`
 */

export function getHashingProvider(hashType: HASH_TYPE): IXyoHashProvider {
  if (['sha256', 'sha512', 'md5', 'sha1', 'sha224'].indexOf(hashType) === -1) {
    throw new XyoError(`Unsupported hash type ${hashType}`, XyoErrors.CRITICAL);
  }

  if (hashProvidersByType[hashType]) {
    return hashProvidersByType[hashType];
  }

  let hashProvider: IXyoHashProvider | undefined;
  switch (hashType) {
    case "sha256":
      hashProvider = new XyoSha256HashProvider();
      break;
    case "sha512":
      hashProvider = new XyoSha512HashProvider();
      break;
    case "md5":
      hashProvider = new XyoMd5HashProvider();
      break;
    case "sha1":
      hashProvider = new XyoSha1HashProvider();
      break;
    case "sha224":
      hashProvider = new XyoSha224HashProvider();
      break;
    default:
      throw new XyoError(`This should never happen`, XyoErrors.CRITICAL);
  }

  hashProvidersByType[hashType] = hashProvider;

  return hashProvider;
}

/**
 * A helper function to create an IXyoPayload
 *
 * @export
 * @param {XyoObject[]} signedPayload The values that will be going into the signed-payload
 * @param {XyoObject[]} unsignedPayload  The values that will be going into the unsigned-payload
 * @returns An instance of an XyoPayload
 */

export function createPayload(signedPayload: XyoObject[], unsignedPayload: XyoObject[]): IXyoPayload {
  return new XyoPayload(
    new XyoMultiTypeArrayInt(signedPayload),
    new XyoMultiTypeArrayInt(unsignedPayload),
  );
}
