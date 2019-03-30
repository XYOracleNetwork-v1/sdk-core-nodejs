/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 28th November 2018 6:00:07 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 4th March 2019 9:34:43 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoObjectSchema } from '@xyo-network/serialization'

export const schema: IXyoObjectSchema = {
  untypedSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x01
  },
  typedSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x01
  },
  boundWitness: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x02
  },
  index: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x03
  },
  nextPublicKey: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x04
  },
  bridgeBlockSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x05
  },
  bridgeHashSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x06
  },
  paymentKey: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0x07
  },
  previousHash: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x08
  },
  ecdsaSecp256k1WithSha256Signature: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x09
  },
  rsaWithSha256Signature: {
    sizeIdentifierSize: 2,
    iterableType: 'not-iterable',
    id: 0x0A
  },
  stubSignature: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0B
  },
  ecSecp256k1UncompressedPublicKey: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0C
  },
  rsaPublicKey: {
    sizeIdentifierSize: 2,
    iterableType: 'not-iterable',
    id: 0x0D
  },
  stubPublicKey: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0E
  },
  stubHash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x0F
  },
  sha256Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x10
  },
  sha3Hash: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x11
  },
  gps: {
    sizeIdentifierSize: 1,
    iterableType: 'iterable-untyped',
    id: 0x12
  },
  rssi: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x13
  },
  time: {
    sizeIdentifierSize: 1,
    iterableType: 'not-iterable',
    id: 0x14
  },
  fetter: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x15
  },
  fetterSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x16
  },
  witness: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x17
  },
  witnessSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-typed',
    id: 0x18
  },
  keySet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x19
  },
  signatureSet: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x1A
  },
  boundWitnessFragment: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x1B
  },
  latitude: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0x1C
  },
  longitude: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0x1D
  },
  stubSigner: {
    sizeIdentifierSize: null,
    iterableType: 'iterable-untyped',
    id: 0x70
  },
  ecdsaSecp256k1WithSha256Signer: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0x71
  },
  rsaSigner: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0x72
  },
  jsonBlob: {
    sizeIdentifierSize: null,
    iterableType: 'not-iterable',
    id: 0xFE
  }
}
