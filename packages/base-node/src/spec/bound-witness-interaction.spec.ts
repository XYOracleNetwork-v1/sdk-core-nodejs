/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 2:49:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness-interaction.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 17th December 2018 11:24:15 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:ter-indent

import { serializer } from '@xyo-network/serializer'
import { XyoBoundWitnessInteraction } from '@xyo-network/peer-interaction-handlers'
import { IXyoPayload, XyoBoundWitnessFragment, XyoFetter, XyoKeySet, XyoWitness, XyoSignatureSet, XyoBoundWitnessValidator } from '@xyo-network/bound-witness'
import { XyoIndex } from '@xyo-network/origin-chain'
import { rssiSerializationProvider } from '@xyo-network/heuristics-common'
import { getSignerProvider, XyoEcdsaSignature, XyoEcdsaSecp256k1UnCompressedPublicKey } from '@xyo-network/signing.ecdsa'
import { getHashingProvider } from '@xyo-network/hashing'
import { XyoStubPublicKey, XyoStubSignature, XyoStubSigner } from '@xyo-network/signing'
import { XyoMockNetworkPipe, CatalogueItem } from '@xyo-network/network'

describe('Server interaction', () => {
  it(`It should leave two parties with the same bound-witness`, async () => {
    const serializationService = serializer
    const serverPublicKey = new XyoStubPublicKey('AABBCCDD')
    const serverSignature = new XyoStubSignature('DDCCBBAA')
    const serverSigner = new XyoStubSigner(serverPublicKey, serverSignature)
    const serverSigners = [serverSigner]
    const serverPayload: IXyoPayload = {
      heuristics: [new XyoIndex(0)],
      metadata: [rssiSerializationProvider.newInstance(-10)]
    }

    const clientPublicKey = new XyoStubPublicKey('00112233')
    const clientSignature = new XyoStubSignature('33221100')
    const clientSigner = new XyoStubSigner(clientPublicKey, clientSignature)
    const clientSigners = [clientSigner]
    const clientKeyset = new XyoKeySet(clientSigners.map(s => s.publicKey))
    const clientSignatureSet = new XyoSignatureSet([clientSignature])
    const clientPayload: IXyoPayload = {
      heuristics: [new XyoIndex(1)],
      metadata: [rssiSerializationProvider.newInstance(-20)]
    }

    const clientFetter = new XyoFetter(
      clientKeyset,
      clientPayload.heuristics
    )

    const clientWitness = new XyoWitness(
      clientSignatureSet,
      clientPayload.metadata
    )

    const clientFetterWitnesses = [
      clientFetter,
      clientWitness
    ]

    const clientBoundWitnessFragment = new XyoBoundWitnessFragment(clientFetterWitnesses)
    const clientSerializedBoundWitnessFragment = clientBoundWitnessFragment.serialize()

    const serverInteraction = new XyoBoundWitnessInteraction(
      serverSigners,
      serverPayload,
      serializationService,
      CatalogueItem.BOUND_WITNESS
    )

    const mockPipe = new XyoMockNetworkPipe({
      0: async (data: Buffer, awaitResponse?: boolean) => {
        return clientSerializedBoundWitnessFragment
      },
      1: async (data: Buffer, awaitResponse?: boolean) => {
        return Buffer.alloc(0)
      }
    }, [
      Buffer.from([
        0x04, // catalogue
        0x00,
        0x00,
        0x00,
        0x01,
          0x30, // 1 byte typed iterable
          0x16, // fetterSet
            0x12, // 36 bytes
              0x20, // 1 byte untyped iterable
              0x15, // fetter
                0x0f, // size 15
                  0x20, // 1 byte untyped iterable
                  0x19, // keySet
                    0x08, // size 8
                      0x00, // 1 byte not iterable
                      0x0e, // stubPublicKey
                      0x05, // size 5
                        0xaa, // pk
                        0xbb,
                        0xcc,
                        0xdd,
                  0x00, // 1 byte not iterable
                  0x03, // index
                  0x02, // size 2
                  0x00, // value
      ]),
      Buffer.from([
        0x30, // 1 byte typed iterable
        0x18, // witnessSet
          0x12, // size 18
            0x20, // 1 byte untyped iterable
            0x17, // witness
              0x0f, // size 15
                0x20, // 1 byte untyped iterable
                0x1a, // signatureSet
                  0x08, // size 8
                    0x00, // 1 byte not-iterable
                    0x0b, // stubSignature
                      0x05, // size 5
                        0xdd, // sig
                        0xcc,
                        0xbb,
                        0xaa,
                0x00, // 1 byte not-iterable
                0x13, // rssi
                  0x02, // size 2
                    0xf6 // value
      ])
    ])

    const resultingBoundWitness = await serverInteraction.run(mockPipe, false)
    expect(resultingBoundWitness.numberOfParties).toBe(2)

    expect(resultingBoundWitness.parties[0].keySet.keys[0].serialize()).toEqual(serverPublicKey.serialize())
    expect(resultingBoundWitness.parties[1].keySet.keys[0].serialize()).toEqual(clientPublicKey.serialize())

    expect(resultingBoundWitness.parties[0].signatureSet.signatures[0].serialize()).toEqual(serverSignature.serialize())
    expect(resultingBoundWitness.parties[1].signatureSet.signatures[0].serialize()).toEqual(clientSignature.serialize())

    expect(resultingBoundWitness.parties[0].heuristics[0].serialize()).toEqual(serverPayload.heuristics[0].serialize())
    expect(resultingBoundWitness.parties[1].heuristics[0].serialize()).toEqual(clientPayload.heuristics[0].serialize())

    expect(resultingBoundWitness.parties[0].metadata[0].serialize()).toEqual(serverPayload.metadata[0].serialize())
    expect(resultingBoundWitness.parties[1].metadata[0].serialize()).toEqual(clientPayload.metadata[0].serialize())

    expect(resultingBoundWitness.serialize()).toEqual(Buffer.from([
      0x20,
      0x02,
        0x45,
          0x20,
          0x15,
            0x0f,
              0x20,
              0x19,
                0x08,
                  0x00,
                  0x0e,
                    0x05,
                      0xaa,
                      0xbb,
                      0xcc,
                      0xdd,
              0x00,
              0x03,
                0x02,
                  0x00,
          0x20,
          0x15,
            0x0f,
              0x20,
              0x19,
                0x08,
                  0x00,
                  0x0e,
                    0x05,
                      0x00,
                      0x11,
                      0x22,
                      0x33,
              0x00,
              0x03,
                0x02,
                  0x01,
          0x20,
          0x17,
            0x0f,
              0x20,
              0x1a,
                0x08,
                  0x00,
                  0x0b,
                    0x05,
                      0x33,
                      0x22,
                      0x11,
                      0x00,
              0x00,
              0x13,
                0x02,
                  0xec,
          0x20,
          0x17,
            0x0f,
              0x20,
              0x1a,
                0x08,
                  0x00,
                  0x0b,
                    0x05,
                      0xdd,
                      0xcc,
                      0xbb,
                      0xaa,
              0x00,
              0x13,
                0x02,
                  0xf6
    ]))
  })

  it(`It should leave two parties with the same bound-witness`, async () => {
    const serializationService = serializer
    const serverSignerProvider = getSignerProvider('secp256k1-sha256')
    const serverSigner = serverSignerProvider.newInstance()
    const serverPublicKey = serverSigner.publicKey
    const serverSigners = [serverSigner]
    const serverPayload: IXyoPayload = {
      heuristics: [new XyoIndex(0)],
      metadata: [rssiSerializationProvider.newInstance(-10)]
    }

    const clientPublicKey = new XyoStubPublicKey('00112233')
    const clientSignature = new XyoStubSignature('33221100')
    const clientSigner = new XyoStubSigner(clientPublicKey, clientSignature)
    const clientSigners = [clientSigner]
    const clientKeyset = new XyoKeySet(clientSigners.map(s => s.publicKey))
    const clientSignatureSet = new XyoSignatureSet([clientSignature])
    const clientPayload: IXyoPayload = {
      heuristics: [new XyoIndex(1)],
      metadata: [rssiSerializationProvider.newInstance(-20)]
    }

    const clientFetter = new XyoFetter(
      clientKeyset,
      clientPayload.heuristics
    )

    const clientWitness = new XyoWitness(
      clientSignatureSet,
      clientPayload.metadata
    )

    const clientFetterWitnesses = [
      clientFetter,
      clientWitness
    ]

    const clientBoundWitnessFragment = new XyoBoundWitnessFragment(clientFetterWitnesses)
    const clientSerializedBoundWitnessFragment = clientBoundWitnessFragment.serialize()

    const serverInteraction = new XyoBoundWitnessInteraction(
      serverSigners,
      serverPayload,
      serializationService,
      CatalogueItem.BOUND_WITNESS
    )

    const mockPipe = new XyoMockNetworkPipe({
      0: async (data: Buffer, awaitResponse?: boolean) => {
        return clientSerializedBoundWitnessFragment
      },
      1: async (data: Buffer, awaitResponse?: boolean) => {
        return Buffer.alloc(0)
      }
    }, [])

    const resultingBoundWitness = await serverInteraction.run(mockPipe, false)
    expect(resultingBoundWitness.numberOfParties).toBe(2)

    expect(resultingBoundWitness.parties[0].keySet.keys[0].serialize()).toEqual(serverPublicKey.serialize())
    expect(resultingBoundWitness.parties[1].keySet.keys[0].serialize()).toEqual(clientPublicKey.serialize())

    expect(resultingBoundWitness.parties[0].heuristics[0].serialize()).toEqual(serverPayload.heuristics[0].serialize())
    expect(resultingBoundWitness.parties[1].heuristics[0].serialize()).toEqual(clientPayload.heuristics[0].serialize())

    expect(resultingBoundWitness.parties[0].metadata[0].serialize()).toEqual(serverPayload.metadata[0].serialize())
    expect(resultingBoundWitness.parties[1].metadata[0].serialize()).toEqual(clientPayload.metadata[0].serialize())

    const validator = new XyoBoundWitnessValidator({
      checkPartyLengths: true,
      checkIndexExists: true,
      checkCountOfSignaturesMatchPublicKeysCount: true,
      validateSignatures: true,
      validateHash: true
    })

    const sha256HashProvider = getHashingProvider('sha256')
    const hash = await sha256HashProvider.createHash(resultingBoundWitness.getSigningData())
    try {
      await validator.validateBoundWitness(hash, resultingBoundWitness)
    } catch (err) {
      throw err
    }
  })

  it(`Should validate signature`, async () => {
    // tslint:disable:max-line-length
    const serializationService = serializer
    const signatureHex = `000943209e5bddcac71e63797f3d3208ce7aa4105c202b7828fd4475482f92c815e2b1242003883b375725e37481792958ba529a91692b84a408952bc470b68c81de2428cf`
    const publicKeyHex = `000c41d49f7ea7330a6997ba8be61f1f9578fd0ee509f4102f00a0b12c1e2171b176d8f69f18779477c6a94bfb36dd5035e2d04415bfcb193e34674cbe1f461ada99f1`
    const signingDataHex = `201571201944000c41d49f7ea7330a6997ba8be61f1f9578fd0ee509f4102f00a0b12c1e2171b176d8f69f18779477c6a94bfb36dd5035e2d04415bfcb193e34674cbe1f461ada99f1200824001021146717735d97eff0078951c9eab1e3c07e353c4e74bbc265636d1188f5e0474c000302366015007a60190046400c004230226f7ebb2f8ffc9e2d1ad366f27ea63603e358d162463ff043c861c3c45e86e24876eb15a9c11fcdadb334b9b0d8169e7a38c82867cc7c6e5fe4a8d2384c047008002640100022146717735d97eff0078951c9eab1e3c07e353c4e74bbc265636d1188f5e0474c4003000600000036`
    const ecdsaSignature = serializationService.deserialize(Buffer.from(signatureHex, 'hex')).hydrate<XyoEcdsaSignature>()
    const ecdsaUnCompressedPublicKey = serializationService.deserialize(Buffer.from(publicKeyHex, 'hex')).hydrate<XyoEcdsaSecp256k1UnCompressedPublicKey>()
    const signingData = Buffer.from(signingDataHex, 'hex')
    const signerProvider = getSignerProvider('secp256k1-sha256')
    const result = await signerProvider.verifySign(ecdsaSignature, signingData, ecdsaUnCompressedPublicKey)
    expect(result).toBe(true)
  })
})
