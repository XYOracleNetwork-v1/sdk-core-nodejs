/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 6:00:07 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 6:00:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectSchema } from '@xyo-network/serialization'

export const schema: IXyoObjectSchema = {
  rssi: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x16
  },
  gps: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x18
  },
  lat: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x19
  },
  lng: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x1a
  },
  time: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x17
  },
  blob: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0xff
  },
  typedSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x14
  },
  untypedSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x15
  },
  hashStub: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0c
  },
  sha256Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x09
  },
  sha3Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0b
  },
  sha512Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0a
  },
  ecSecp256k1UncompressedPublicKey: {
    sizeIdentifierSize: 1,
    iterableType: 'iterable-untyped',
    id: 0x0d
  },
  rsaPublicKey: {
    sizeIdentifierSize: 2,
    iterableType: 'not-iterable',
    id: 0x11
  },
  stubPublicKey: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x10
  },
  ecdsaSecp256k1WithSha256Signature: {
    sizeIdentifierSize: 1,
    iterableType: 'iterable-untyped',
    id: 0x12
  },
  rsaWithSha256Signature: {
    sizeIdentifierSize: 2,
    iterableType: 'not-iterable',
    id: 0x13
  },
  stubSignature: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x1b
  },
  boundWitness: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x00
  },
  index: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x04
  },
  keySet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x01
  },
  nextPublicKey: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x06
  },
  originBlockHashSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x07
  },
  originBlockSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x08
  },
  payload: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x03
  },
  previousHash: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x05
  },
  signatureSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x02
  },
}
