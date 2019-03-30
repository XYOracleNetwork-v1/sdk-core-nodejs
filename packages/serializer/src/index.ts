/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 17th December 2018 11:15:22 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 2:55:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { sha256HashDeserializer, sha3HashDeserializer, XyoStubHash } from '@xyo-network/hashing'
import { XyoStubPublicKey, XyoStubSignature, XyoStubSigner } from '@xyo-network/signing'
import { XyoEcdsaSignature, XyoEcdsaSecp256k1UnCompressedPublicKey, XyoEcdsaSecp256k1Signer } from '@xyo-network/signing.ecdsa'
import { XyoRsaPublicKey, rsaWithSha256SignatureDeserializer, XyoRsaShaSigner } from '@xyo-network/signing.rsa'

import {
  XyoIndex,
  XyoNextPublicKey,
  XyoBridgeHashSet,
  XyoPreviousHash,
  XyoBridgeBlockSet
} from '@xyo-network/origin-chain'

import {
  XyoKeySet,
  XyoSignatureSet,
  XyoFetter,
  XyoWitness,
  XyoFetterSet,
  XyoWitnessSet,
  XyoBoundWitnessFragment,
  XyoBoundWitness
} from '@xyo-network/bound-witness'
import { IXyoSerializationService, XyoSerializationService } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'
import { rssiSerializationProvider, XyoUnixTime, latitudeSerializationProvider, longitudeSerializationProvider, XyoGps, XyoJSONBlob } from '@xyo-network/heuristics-common'

function createSerializer(): IXyoSerializationService {
  const serializationService = new XyoSerializationService(schema)

  serializationService.addDeserializer(XyoEcdsaSignature.deserializer)
  serializationService.addDeserializer(XyoStubSignature)
  serializationService.addDeserializer(XyoStubPublicKey)
  serializationService.addDeserializer(XyoStubHash)
  serializationService.addDeserializer(XyoEcdsaSecp256k1UnCompressedPublicKey.deserializer)
  serializationService.addDeserializer(XyoIndex.deserializer)
  serializationService.addDeserializer(XyoNextPublicKey.deserializer)
  serializationService.addDeserializer(XyoBridgeHashSet.deserializer)
  serializationService.addDeserializer(XyoPreviousHash.deserializer)
  serializationService.addDeserializer(rssiSerializationProvider.deserializer)
  serializationService.addDeserializer(XyoUnixTime.deserializer)
  serializationService.addDeserializer(latitudeSerializationProvider.deserializer)
  serializationService.addDeserializer(longitudeSerializationProvider.deserializer)
  serializationService.addDeserializer(XyoGps.deserializer)
  serializationService.addDeserializer(XyoRsaPublicKey)
  serializationService.addDeserializer(rsaWithSha256SignatureDeserializer)
  serializationService.addDeserializer(sha256HashDeserializer)
  serializationService.addDeserializer(sha3HashDeserializer)
  serializationService.addDeserializer(XyoKeySet.deserializer)
  serializationService.addDeserializer(XyoSignatureSet.deserializer)
  serializationService.addDeserializer(XyoFetter.deserializer)
  serializationService.addDeserializer(XyoWitness.deserializer)
  serializationService.addDeserializer(XyoFetterSet.deserializer)
  serializationService.addDeserializer(XyoWitnessSet.deserializer)
  serializationService.addDeserializer(XyoBoundWitnessFragment.deserializer)
  serializationService.addDeserializer(XyoBoundWitness.deserializer)
  serializationService.addDeserializer(XyoBridgeBlockSet.deserializer)
  serializationService.addDeserializer(XyoStubSigner.deserializer)
  serializationService.addDeserializer(XyoRsaShaSigner.deserializer)
  serializationService.addDeserializer(XyoEcdsaSecp256k1Signer.deserializer)
  serializationService.addDeserializer(XyoJSONBlob.deserializer)
  return serializationService
}

export const serializer = createSerializer()
