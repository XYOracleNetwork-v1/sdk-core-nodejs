/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 3:06:15 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serialization-recipes.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 3:07:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { schema } from '@xyo-network/serialization-schema'
import { XyoNumberDeserializer, XyoNotYetImplementedSerializer, XyoBoundWitnessDeserializer } from '@xyo-network/serializers'

export const recipes = {
  [schema.rssi.id]: new XyoNumberDeserializer(false, schema.rssi.id),
  [schema.gps.id]: new XyoNotYetImplementedSerializer(schema.gps.id),
  // [schema.lat.id]: new XyoNotYetImplementedSerializer(schema.lat.id),
  // [schema.lng.id]: new XyoNotYetImplementedSerializer(schema.lng.id),
  [schema.time.id]: new XyoNotYetImplementedSerializer(schema.time.id),
  // [schema.blob.id]: new XyoNotYetImplementedSerializer(schema.blob.id),
  [schema.typedSet.id]: new XyoNotYetImplementedSerializer(schema.typedSet.id),
  [schema.untypedSet.id]: new XyoNotYetImplementedSerializer(schema.untypedSet.id),
  [schema.hashStub.id]: new XyoNotYetImplementedSerializer(schema.hashStub.id),
  [schema.sha256Hash.id]: new XyoNotYetImplementedSerializer(schema.sha256Hash.id),
  [schema.sha3Hash.id]: new XyoNotYetImplementedSerializer(schema.sha3Hash.id),
  // [schema.sha512Hash.id]: new XyoNotYetImplementedSerializer(schema.sha512Hash.id),
  // tslint:disable-next-line:max-line-length
  [schema.ecSecp256k1UncompressedPublicKey.id]: new XyoNotYetImplementedSerializer(schema.ecSecp256k1UncompressedPublicKey.id),
  [schema.rsaPublicKey.id]: new XyoNotYetImplementedSerializer(schema.rsaPublicKey.id),
  [schema.stubPublicKey.id]: new XyoNotYetImplementedSerializer(schema.stubPublicKey.id),

  // tslint:disable-next-line:max-line-length
  [schema.ecdsaSecp256k1WithSha256Signature.id]: new XyoNotYetImplementedSerializer(schema.ecdsaSecp256k1WithSha256Signature.id),
  [schema.rsaWithSha256Signature.id]: new XyoNotYetImplementedSerializer(schema.rsaWithSha256Signature.id),
  [schema.stubSignature.id]: new XyoNotYetImplementedSerializer(schema.stubSignature.id),
  [schema.index.id]: new XyoNumberDeserializer(false, schema.index.id),
  // [schema.keySet.id]: new XyoNotYetImplementedSerializer(schema.keySet.id),
  [schema.nextPublicKey.id]: new XyoNotYetImplementedSerializer(schema.nextPublicKey.id),
  [schema.originBlockHashSet.id]: new XyoNotYetImplementedSerializer(schema.originBlockHashSet.id),
  [schema.originBlockSet.id]: new XyoNotYetImplementedSerializer(schema.originBlockSet.id),
  [schema.payload.id]: new XyoNotYetImplementedSerializer(schema.payload.id),
  [schema.previousHash.id]: new XyoNotYetImplementedSerializer(schema.previousHash.id),
  // [schema.signatureSet.id]: new XyoNotYetImplementedSerializer(schema.signatureSet.id),
  [schema.boundWitness.id]: new XyoBoundWitnessDeserializer()
}
