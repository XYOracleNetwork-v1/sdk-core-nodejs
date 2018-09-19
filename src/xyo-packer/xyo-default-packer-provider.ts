/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 1:33:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th September 2018 1:36:48 pm
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
import { XyoSingleTypeArrayByte } from '../components/arrays/xyo-single-type-array-byte';
import { XyoSingleTypeArrayShort } from '../components/arrays/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../components/arrays/xyo-single-type-array-int';
import { XyoMultiTypeArrayByte } from '../components/arrays/xyo-multi-type-array-byte';
import { XyoMultiTypeArrayShort } from '../components/arrays/xyo-multi-type-array-short';
import { XyoMultiTypeArrayInt } from '../components/arrays/xyo-multi-type-array-int';
import { XyoPayloadSerializer } from './serializers/xyo-payload-serializer';
import { XyoMd5Hash } from '../components/hashing/xyo-md5-hash';
import { XyoMd2Hash } from '../components/hashing/xyo-md2-hash';
import { XyoSha1Hash } from '../components/hashing/xyo-sha1-hash';
import { XyoSha224Hash } from '../components/hashing/xyo-sha224-hash';
import { XyoSha256Hash } from '../components/hashing/xyo-sha256-hash';
import { XyoSha512Hash } from '../components/hashing/xyo-sha512-hash';
import { XyoMd5HashProvider } from '../hash-provider/xyo-md5-hash-provider';
import { XyoSha1HashProvider } from '../hash-provider/xyo-sha1-hash-provider';
import { XyoSha224HashProvider } from '../hash-provider/xyo-sha224-hash-provider';
import { XyoSha256HashProvider } from '../hash-provider/xyo-sha256-hash-provider';
import { XyoSha512HashProvider } from '../hash-provider/xyo-sha512-hash-provider';
import { XyoRSASha256Signature } from '../components/signing/algorithms/rsa/xyo-rsa-sha256-signature';
import { XyoRSASha256SignerProvider } from '../signing/xyo-rsa-sha256-signer-provider';
import { XyoRsaSignatureSerializer } from './serializers/xyo-rsa-signature-serializer';

/**
 * A class for configuring the packing, serialization, and deserialization
 * for the xyo protocol
 */

export class XyoDefaultPackerProvider {

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
    packer.registerSerializerDeserializer(XyoSingleTypeArrayShort.name, new XyoArraySerializer(0x01, 0x02, 2, true));
    packer.registerSerializerDeserializer(XyoSingleTypeArrayInt.name, new XyoArraySerializer(0x01, 0x03, 4, true));

    packer.registerSerializerDeserializer(XyoMultiTypeArrayByte.name, new XyoArraySerializer(0x01, 0x04, 1, false));
    packer.registerSerializerDeserializer(XyoMultiTypeArrayShort.name, new XyoArraySerializer(0x01, 0x05, 2, false));
    packer.registerSerializerDeserializer(XyoMultiTypeArrayInt.name, new XyoArraySerializer(0x01, 0x06, 4, false));
    packer.registerSerializerDeserializer(XyoBoundWitnessTransfer.name, new XyoBoundWitnessTransferSerializer());
    packer.registerSerializerDeserializer(XyoBoundWitness.name, new XyoBoundWitnessSerializer());

    packer.registerSerializerDeserializer(
      XyoMd2Hash.name,
      new XyoHashSerializer(0x01, 16, undefined, XyoMd2Hash)
    );

    packer.registerSerializerDeserializer(
      XyoMd5Hash.name,
      new XyoHashSerializer(0x02, 16, new XyoMd5HashProvider(), XyoMd5Hash)
    );

    packer.registerSerializerDeserializer(
      XyoSha1Hash.name,
      new XyoHashSerializer(0x03, 20, new XyoSha1HashProvider(), XyoSha1Hash)
    );

    packer.registerSerializerDeserializer(
      XyoSha224Hash.name,
      new XyoHashSerializer(0x04, 28, new XyoSha224HashProvider(), XyoSha224Hash)
    );

    packer.registerSerializerDeserializer(
      XyoSha256Hash.name,
      new XyoHashSerializer(0x05, 32, new XyoSha256HashProvider(), XyoSha256Hash)
    );

    packer.registerSerializerDeserializer(
      XyoSha512Hash.name,
      new XyoHashSerializer(0x06, 64, new XyoSha512HashProvider(), XyoSha512Hash)
    );

    const rsaSha256SignerProvider = new XyoRSASha256SignerProvider();

    packer.registerSerializerDeserializer(XyoRSASha256Signature.name,
      new XyoRsaSignatureSerializer(0x08, rsaSha256SignerProvider, XyoRSASha256Signature)
    );

    return packer;
  }
}
