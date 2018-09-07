/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 1:33:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th September 2018 4:54:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoPacker } from './xyo-packer';

import { XyoKeySetSerializer } from './serializers/xyo-key-set-serializer';
import { XyoArraySerializer } from './serializers/xyo-array-serializer';
import { XyoSignatureSetSerializer } from './serializers/xyo-signature-set-serializer';
import { XyoBoundWitnessTransferSerializer } from './serializers/xyo-bound-witness-transfer-serializer';
import { XyoBoundWitnessSerializer } from './serializers/xyo-bound-witness-serializer';
import { XyoHashSerializer } from './serializers/xyo-hash-serializer';
import { XyoPreviousHashSerializer } from './serializers/xyo-previous-hash-serializer';
import { XyoNumberUnsignedSerializer } from './serializers/xyo-number-unsigned-serializer';
import { XyoNumberSignedSerializer } from './serializers/xyo-number-signed-serializer';
import { XyoUncompressedEcPublicKeySerializer } from './serializers/xyo-uncompressed-ec-public-key-serializer';
import { XyoRsaPublicKeySerializer } from './serializers/xyo-rsa-public-key-serializer';
import { XyoNextPublicKeySerializer } from './serializers/xyo-next-public-key-serializer';
import { XyoKeySet } from '../components/arrays/xyo-key-set';
import { XyoIndex } from '../components/heuristics/numbers/xyo-index';
import { XyoRssi } from '../components/heuristics/numbers/xyo-rssi';
import { XyoSignatureSet } from '../components/arrays/xyo-signature-set';
import { XyoPreviousHash } from '../components/hashing/xyo-previous-hash';
import { XyoRsaPublicKey } from '../components/signing/algorithms/rsa/xyo-rsa-public-key';
import { XyoNextPublicKey } from '../components/signing/xyo-next-public-key';
import { XyoPayload } from '../components/xyo-payload';
import { XyoBoundWitnessTransfer } from '../components/bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../components/bound-witness/xyo-bound-witness';
import { XyoHashToHashProviderMap } from '../components/hashing/xyo-hash-to-hash-provider-map';
import { XyoSingleTypeArrayByte } from '../components/arrays/xyo-single-type-array-byte';
import { XyoSingleTypeArrayShort } from '../components/arrays/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../components/arrays/xyo-single-type-array-int';
import { XyoMultiTypeArrayByte } from '../components/arrays/xyo-multi-type-array-byte';
import { XyoMultiTypeArrayShort } from '../components/arrays/xyo-multi-type-array-short';
import { XyoMultiTypeArrayInt } from '../components/arrays/xyo-multi-type-array-int';
import { XyoPayloadSerializer } from './serializers/xyo-payload-serializer';

/**
 * A class for configuring the packing, serialization, and deserialization
 * for the xyo protocol
 */

export class XyoDefaultPacker {

  constructor (private readonly hashToHashProviderMap: XyoHashToHashProviderMap) {}

  public getXyoPacker() {
    const packer = new XyoPacker();

    packer.registerSerializerDeserializer(XyoKeySet.name, new XyoKeySetSerializer());
    packer.registerSerializerDeserializer(XyoSignatureSet.name, new XyoSignatureSetSerializer());
    packer.registerSerializerDeserializer(XyoPreviousHash.name, new XyoPreviousHashSerializer());
    packer.registerSerializerDeserializer(XyoRssi.name, new XyoNumberSignedSerializer(0x08, 0x01, 1));
    packer.registerSerializerDeserializer(XyoIndex.name, new XyoNumberUnsignedSerializer(0x02, 0x05, 4));
    packer.registerSerializerDeserializer('XyoSecp256k1', new XyoUncompressedEcPublicKeySerializer(0x01));
    packer.registerSerializerDeserializer(XyoRsaPublicKey.name, new XyoRsaPublicKeySerializer());
    packer.registerSerializerDeserializer(XyoNextPublicKey.name, new XyoNextPublicKeySerializer());
    packer.registerSerializerDeserializer(XyoPayload.name, new XyoPayloadSerializer());
    packer.registerSerializerDeserializer(XyoSingleTypeArrayByte.name, new XyoArraySerializer(0x01, 0x01, 1, true));
    packer.registerSerializerDeserializer(XyoSingleTypeArrayShort.name, new XyoArraySerializer(0x01, 0x02, 1, true));
    packer.registerSerializerDeserializer(XyoSingleTypeArrayInt.name, new XyoArraySerializer(0x01, 0x03, 1, true));
    packer.registerSerializerDeserializer(XyoMultiTypeArrayByte.name, new XyoArraySerializer(0x01, 0x04, 1, false));
    packer.registerSerializerDeserializer(XyoMultiTypeArrayShort.name, new XyoArraySerializer(0x01, 0x05, 2, false));
    packer.registerSerializerDeserializer(XyoMultiTypeArrayInt.name, new XyoArraySerializer(0x01, 0x06, 4, false));
    packer.registerSerializerDeserializer(XyoBoundWitnessTransfer.name, new XyoBoundWitnessTransferSerializer());
    packer.registerSerializerDeserializer(XyoBoundWitness.name, new XyoBoundWitnessSerializer());
    packer.registerSerializerDeserializer('XyoMd5', new XyoHashSerializer(0x10, 16, this.hashToHashProviderMap));
    packer.registerSerializerDeserializer('XyoSha1', new XyoHashSerializer(0x02, 20, this.hashToHashProviderMap));
    packer.registerSerializerDeserializer('XyoSha224', new XyoHashSerializer(0x0a, 20, this.hashToHashProviderMap));
    packer.registerSerializerDeserializer('XyoSha256', new XyoHashSerializer(0x05, 32, this.hashToHashProviderMap));
    packer.registerSerializerDeserializer('XyoSha384', new XyoHashSerializer(0x0C, 48, this.hashToHashProviderMap));
    packer.registerSerializerDeserializer('XyoSha512', new XyoHashSerializer(0x0D, 64, this.hashToHashProviderMap));
  }
}
