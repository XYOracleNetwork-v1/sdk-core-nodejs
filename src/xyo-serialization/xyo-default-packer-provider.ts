/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th September 2018 1:33:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:12:29 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:max-line-length

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
import { XyoEcdsaUncompressedPublicKeySerializer } from './serializers/xyo-ecdsa-uncompressed-public-key-serializer';
import { XyoRsaPublicKeySerializer } from './serializers/xyo-rsa-public-key-serializer';
import { XyoNextPublicKeySerializer } from './serializers/xyo-next-public-key-serializer';
import { XyoKeySet } from '../xyo-signing/xyo-key-set';
import { XyoIndex } from '../xyo-core-components/heuristics/numbers/xyo-index';
import { XyoRssi } from '../xyo-core-components/heuristics/numbers/xyo-rssi';
import { XyoSignatureSet } from '../xyo-signing/xyo-signature-set';
import { XyoRsaPublicKey } from '../xyo-signing/rsa/xyo-rsa-public-key';
import { XyoNextPublicKey } from '../xyo-signing/xyo-next-public-key';
import { XyoPayload } from '../xyo-core-components/xyo-payload';
import { XyoBoundWitnessTransfer } from '../xyo-bound-witness/xyo-bound-witness-transfer';
import { XyoBoundWitness } from '../xyo-bound-witness/xyo-bound-witness';
import { XyoSingleTypeArrayByte } from '../xyo-core-components/arrays/xyo-single-type-array-byte';
import { XyoSingleTypeArrayShort } from '../xyo-core-components/arrays/xyo-single-type-array-short';
import { XyoSingleTypeArrayInt } from '../xyo-core-components/arrays/xyo-single-type-array-int';
import { XyoMultiTypeArrayByte } from '../xyo-core-components/arrays/xyo-multi-type-array-byte';
import { XyoMultiTypeArrayShort } from '../xyo-core-components/arrays/xyo-multi-type-array-short';
import { XyoMultiTypeArrayInt } from '../xyo-core-components/arrays/xyo-multi-type-array-int';
import { XyoPayloadSerializer } from './serializers/xyo-payload-serializer';
import { XyoMd5Hash } from '../xyo-hashing/md5/xyo-md5-hash';
import { XyoMd2Hash } from '../xyo-hashing/md2/xyo-md2-hash';
import { XyoSha1Hash } from '../xyo-hashing/sha1/xyo-sha1-hash';
import { XyoSha224Hash } from '../xyo-hashing/sha224/xyo-sha224-hash';
import { XyoSha256Hash } from '../xyo-hashing/sha256/xyo-sha256-hash';
import { XyoSha512Hash } from '../xyo-hashing/sha512/xyo-sha512-hash';
import { XyoPreviousHash } from '../xyo-hashing/xyo-previous-hash';
import { XyoMd5HashProvider } from '../xyo-hashing/md5/xyo-md5-hash-provider';
import { XyoSha1HashProvider } from '../xyo-hashing/sha1/xyo-sha1-hash-provider';
import { XyoSha224HashProvider } from '../xyo-hashing/sha224/xyo-sha224-hash-provider';
import { XyoSha256HashProvider } from '../xyo-hashing/sha256/xyo-sha256-hash-provider';
import { XyoSha512HashProvider } from '../xyo-hashing/sha512/xyo-sha512-hash-provider';
import { XyoRsaSha256Signature } from '../xyo-signing/rsa/sha256/xyo-rsa-sha256-signature';
import { XyoRsaSha256SignerProvider } from '../xyo-signing/rsa/sha256/xyo-rsa-sha256-signer-provider';
import { XyoRsaSignatureSerializer } from './serializers/xyo-rsa-signature-serializer';
import { XyoRsaShaSignerSerializer } from './serializers/xyo-rsa-sha-signer-serializer';
import { XyoRsaSha256Signer } from '../xyo-signing/rsa/sha256/xyo-rsa-sha256-signer';
import { XyoRsaSha1Signer } from '../xyo-signing/rsa/sha1/xyo-rsa-sha1-signer';
import { XyoEcdsaSecp256k1SignerSerializer } from './serializers/xyo-ecdsa-secp256k1-serializer';
import { XyoEcdsaSignatureSerializer } from './serializers/xyo-ecdsa-signature-serializer';
import { XyoBridgeBlockSet } from '../xyo-core-components/arrays/xyo-bridge-block-set';
import { XyoBridgeBlockSetSerializer } from './serializers/xyo-bridge-block-set-serializer';
import { XyoBridgeHashSet } from '../xyo-core-components/arrays/xyo-bridge-hash-set';
import { XyoEcdsaSecp256k1UnCompressedPublicKey } from '../xyo-signing/ecdsa/secp256k1/xyo-ecdsa-secp256k1-uncompressed-public-key';
import { XyoEcdsaSecp256k1Sha256SignerProvider } from '../xyo-signing/ecdsa/secp256k1/sha256/xyo-ecdsa-secp256k1-sha256-signer-provider';
import { XyoEcdsaSecp256k1Sha1SignerProvider } from '../xyo-signing/ecdsa/secp256k1/sha1/xyo-ecdsa-secp256k1-sha1-signer-provider';
import { XyoRsaSha1SignerProvider } from '../xyo-signing/rsa/sha1/xyo-rsa-sha1-signer-provider';
import { XyoRsaSha1Signature } from '../xyo-signing/rsa/sha1/xyo-rsa-sha1-signature';
import { XyoEcdsaSecp256k1Sha256Signature } from '../xyo-signing/ecdsa/secp256k1/sha256/xyo-ecdsa-secp256k1-sha256-signature';
import { XyoEcdsaSecp256k1Sha1Signature } from '../xyo-signing/ecdsa/secp256k1/sha1/xyo-ecdsa-secp256k1-sha1-signature';
import { XyoEcdsaSecp256k1Sha256Signer } from '../xyo-signing/ecdsa/secp256k1/sha256/xyo-ecdsa-secp256k1-sha256-signer';
import { XyoEcdsaSecp256k1Sha1Signer } from '../xyo-signing/ecdsa/secp256k1/sha1/xyo-ecdsa-secp256k1-sha1-signer';
import { XyoObject } from '../xyo-core-components/xyo-object';
import { XyoSerializer } from './xyo-serializer';
import { XyoBase } from '../xyo-core-components/xyo-base';
import { XyoObjectDescriptor } from '../@types/xyo-serialization';

/**
 * A class for configuring the packing, serialization, and deserialization
 * for the xyo protocol
 */

export class XyoDefaultPackerProvider extends XyoBase {

  public getXyoPacker() {
    const packer = new XyoPacker();
    const add = this.getRegisterFn(packer);

    const sha256HashProvider = new XyoSha256HashProvider();
    const sha1HashProvider = new XyoSha1HashProvider();
    const rsaSha256SignerProvider = new XyoRsaSha256SignerProvider();
    const rsaSha1SignerProvider = new XyoRsaSha1SignerProvider();
    const ecdsaSecp256k1Sha256SignerProvider = new XyoEcdsaSecp256k1Sha256SignerProvider(sha256HashProvider);
    const ecdsaSecp256k1Sha1SignerProvider = new XyoEcdsaSecp256k1Sha1SignerProvider(sha1HashProvider);

    add(XyoKeySet, new XyoKeySetSerializer());
    add(XyoSignatureSet, new XyoSignatureSetSerializer());
    add(XyoPreviousHash, new XyoPreviousHashSerializer());
    add(XyoRssi, new XyoNumberSignedSerializer(XyoRssi.major, XyoRssi.minor, 1));
    add(XyoIndex, new XyoNumberUnsignedSerializer(XyoIndex.major, XyoIndex.minor, 4));
    add(XyoEcdsaSecp256k1UnCompressedPublicKey, new XyoEcdsaUncompressedPublicKeySerializer(XyoEcdsaSecp256k1UnCompressedPublicKey.minor, { newInstance: (x, y) => new XyoEcdsaSecp256k1UnCompressedPublicKey(x, y) }));
    add(XyoRsaPublicKey, new XyoRsaPublicKeySerializer());
    add(XyoNextPublicKey, new XyoNextPublicKeySerializer());
    add(XyoPayload, new XyoPayloadSerializer());
    add(XyoSingleTypeArrayByte, new XyoArraySerializer(XyoSingleTypeArrayByte.major, XyoSingleTypeArrayByte.minor, 1, true));
    add(XyoSingleTypeArrayShort, new XyoArraySerializer(XyoSingleTypeArrayShort.major, XyoSingleTypeArrayShort.minor, 2, true));
    add(XyoSingleTypeArrayInt, new XyoArraySerializer(XyoSingleTypeArrayInt.major, XyoSingleTypeArrayInt.minor, 4, true));
    add(XyoMultiTypeArrayByte, new XyoArraySerializer(XyoMultiTypeArrayByte.major, XyoMultiTypeArrayByte.minor, 1, false));
    add(XyoMultiTypeArrayShort, new XyoArraySerializer(XyoMultiTypeArrayShort.major, XyoMultiTypeArrayShort.minor, 2, false));
    add(XyoMultiTypeArrayInt, new XyoArraySerializer(XyoMultiTypeArrayInt.major, XyoMultiTypeArrayInt.minor, 4, false));
    add(XyoBoundWitnessTransfer, new XyoBoundWitnessTransferSerializer());
    add(XyoBoundWitness, new XyoBoundWitnessSerializer());
    add(XyoBridgeHashSet, new XyoArraySerializer(XyoBridgeHashSet.major, XyoBridgeHashSet.minor, 2, false));
    add(XyoMd2Hash, new XyoHashSerializer(XyoMd2Hash.minor, 16, undefined, { newInstance: (hashProvider, hash) => new XyoMd2Hash(hashProvider, hash) }));
    add(XyoMd5Hash, new XyoHashSerializer(XyoMd5Hash.minor, 16, new XyoMd5HashProvider(), { newInstance: (hashProvider, hash) => new XyoMd5Hash(hashProvider, hash) }));
    add(XyoSha1Hash, new XyoHashSerializer(XyoSha1Hash.minor, 20, sha1HashProvider, { newInstance: (hashProvider, hash) => new XyoSha1Hash(hashProvider, hash) }));
    add(XyoSha224Hash, new XyoHashSerializer(XyoSha224Hash.minor, 28, new XyoSha224HashProvider(), { newInstance: (hashProvider, hash) => new XyoSha224Hash(hashProvider, hash) }));
    add(XyoSha256Hash, new XyoHashSerializer(XyoSha256Hash.minor, 32, sha256HashProvider, { newInstance: (hashProvider, hash) => new XyoSha256Hash(hashProvider, hash) }));
    add(XyoSha512Hash, new XyoHashSerializer(XyoSha512Hash.minor, 64, new XyoSha512HashProvider(), { newInstance: (hashProvider, hash) => new XyoSha512Hash(hashProvider, hash) }));
    add(XyoBridgeBlockSet, new XyoBridgeBlockSetSerializer());
    add(XyoRsaSha256Signature, new XyoRsaSignatureSerializer(XyoRsaSha256Signature.minor, rsaSha256SignerProvider, XyoRsaSha256Signature));
    add(XyoRsaSha1Signature, new XyoRsaSignatureSerializer(XyoRsaSha1Signature.minor, rsaSha1SignerProvider, XyoRsaSha1Signature));
    add(XyoRsaSha256Signer, new XyoRsaShaSignerSerializer(rsaSha256SignerProvider, XyoRsaSha256Signer.minor));
    add(XyoRsaSha1Signer, new XyoRsaShaSignerSerializer(rsaSha1SignerProvider, XyoRsaSha1Signer.minor));
    add(XyoEcdsaSecp256k1Sha256Signer, new XyoEcdsaSecp256k1SignerSerializer(XyoEcdsaSecp256k1Sha256Signer.minor, ecdsaSecp256k1Sha256SignerProvider));
    add(XyoEcdsaSecp256k1Sha1Signer, new XyoEcdsaSecp256k1SignerSerializer(XyoEcdsaSecp256k1Sha1Signer.minor, ecdsaSecp256k1Sha1SignerProvider));
    add(XyoEcdsaSecp256k1Sha256Signature, new XyoEcdsaSignatureSerializer(XyoEcdsaSecp256k1Sha256Signature.minor, ecdsaSecp256k1Sha256SignerProvider.verifySign.bind(ecdsaSecp256k1Sha256SignerProvider), { newInstance: (signature, verify) => new XyoEcdsaSecp256k1Sha256Signature(signature, verify) }));
    add(XyoEcdsaSecp256k1Sha1Signature, new XyoEcdsaSignatureSerializer(XyoEcdsaSecp256k1Sha1Signature.minor, ecdsaSecp256k1Sha1SignerProvider.verifySign.bind(ecdsaSecp256k1Sha256SignerProvider), { newInstance: (signature, verify) => new XyoEcdsaSecp256k1Sha1Signature(signature, verify) }));

    return packer;
  }

  private getRegisterFn(packer: XyoPacker) {
    return <T extends XyoObject>(descriptor: XyoObjectDescriptor, serializer: XyoSerializer<T>) => {
      // this.logInfo(`Adding ${descriptor.name} as ${descriptor.major.toString(16)} ${descriptor.minor.toString(16)}`);
      packer.registerSerializerDeserializer(descriptor, serializer);
    };
  }
}
