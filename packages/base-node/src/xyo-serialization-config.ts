/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 2:51:17 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization-config.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 11:21:18 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { sha256HashDeserializer, XyoStubHash } from '@xyo-network/hashing'
import { XyoStubPublicKey, XyoStubSignature } from '@xyo-network/signing'
import { XyoEcdsaSignature, XyoEcdsaSecp256k1UnCompressedPublicKey } from '@xyo-network/signing.ecdsa'
import { XyoRsaPublicKey, rsaWithSha256SignatureDeserializer } from '@xyo-network/signing.rsa'

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
import { IXyoSerializationService, XyoSerializationService, XyoBaseSerializable } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'
import { rssiSerializationProvider, unixTimeSerializationProvider, latitudeSerializationProvider, longitudeSerializationProvider, XyoGps } from '@xyo-network/heuristics-common'

export function createSerializer(): IXyoSerializationService {
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
  serializationService.addDeserializer(unixTimeSerializationProvider.deserializer)
  serializationService.addDeserializer(latitudeSerializationProvider.deserializer)
  serializationService.addDeserializer(longitudeSerializationProvider.deserializer)
  serializationService.addDeserializer(XyoGps.deserializer)
  serializationService.addDeserializer(XyoRsaPublicKey)
  serializationService.addDeserializer(rsaWithSha256SignatureDeserializer)
  serializationService.addDeserializer(sha256HashDeserializer)
  serializationService.addDeserializer(XyoKeySet.deserializer)
  serializationService.addDeserializer(XyoSignatureSet.deserializer)
  serializationService.addDeserializer(XyoFetter.deserializer)
  serializationService.addDeserializer(XyoWitness.deserializer)
  serializationService.addDeserializer(XyoFetterSet.deserializer)
  serializationService.addDeserializer(XyoWitnessSet.deserializer)
  serializationService.addDeserializer(XyoBoundWitnessFragment.deserializer)
  serializationService.addDeserializer(XyoBoundWitness.deserializer)
  serializationService.addDeserializer(XyoBridgeBlockSet.deserializer)
  return serializationService
}
