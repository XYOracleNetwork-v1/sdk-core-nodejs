/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 1:11:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 12:03:12 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessStandardServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { IXyoSigner, IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { XyoBasePayload, XyoBoundWitnessSigningService, IXyoBoundWitness, XyoBaseBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoSerializableObject, XyoSerializationService, BufferOrString, IXyoDeserializer, IXyoSerializationService, parse, ParseQuery } from '@xyo-network/serialization'
import { IXyoNetworkPipe, IXyoNetworkPeer, CatalogueItem } from '@xyo-network/network'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBoundWitnessDeserializer, XyoSerializableNumber, XyoNumberDeserializer, XyoBlobDeserializer } from '@xyo-network/serializers'

describe(`Bound Witness Interaction`, () => {
  it(`Should leave two parties with the same bound-witness data`, async () => {
    const serverMockPublicKey = new MockPublicKey('00000000')
    const serverMockSignature = new MockSignature('11111111')
    const serverMockSigner = new MockSigner(
      serverMockPublicKey,
      serverMockSignature
    )
    const serverSigners = [serverMockSigner]

    const clientMockPublicKey1 = new MockPublicKey('22222222')
    const clientMockPublicKey2 = new MockPublicKey('44444444')
    const clientMockSignature1 = new MockSignature('33333333')
    const clientMockSignature2 = new MockSignature('55555555')

    const clientMockSigner1 = new MockSigner(
      clientMockPublicKey1,
      clientMockSignature1
    )

    const clientMockSigner2 = new MockSigner(
      clientMockPublicKey2,
      clientMockSignature2
    )
    const clientSigners = [clientMockSigner1, clientMockSigner2]

    const serverPayload = new MockPayload(
      [
        new XyoSerializableNumber(0, false, schema.index.id)
      ],
      [
        new XyoSerializableNumber(-10, true, schema.rssi.id)
      ]
    )

    const clientPayload = new MockPayload(
      [
        new XyoSerializableNumber(0, false, schema.index.id)
      ],
      [
        new XyoSerializableNumber(-10, true, schema.rssi.id)
      ]
    )

    const signingService = new XyoBoundWitnessSigningService({
      getSigningData: (boundWitness: IXyoBoundWitness) => {
        return Buffer.alloc(4)
      }
    })

    const serializationService = new XyoSerializationService(schema, {
      [schema.boundWitness.id]: new XyoBoundWitnessDeserializer(),
      [schema.stubPublicKey.id]: new MockPublicKeyDeserializer(),
      [schema.index.id]: new XyoNumberDeserializer(false, schema.index.id),
      [schema.rssi.id]: new XyoNumberDeserializer(true, schema.rssi.id),
      [schema.stubSignature.id]: new XyoBlobDeserializer(schema.stubSignature.id, (blob) => {
        return new MockSignature(blob.toString('hex'))
      })
    })

    const boundWitnessSerializer = serializationService.getInstanceOfTypeSerializer<IXyoBoundWitness>()

    // let step = 0
    // boundWitnessSerializer.deserialize = (deserializable: BufferOrString) => {
    //   step += 1
    //   if (step === 1) {
    //     return new MockBoundWitness(
    //       [
    //         clientSigners.map(signer => signer.publicKey)
    //       ],
    //       [
    //         [clientMockSignature]
    //       ],
    //       [
    //         clientPayload
    //       ]
    //     )
    //   }

    //   return new MockBoundWitness([], [], [])
    // }

    const interaction = new XyoBoundWitnessStandardServerInteraction(
      serverSigners,
      serverPayload,
      signingService,
      boundWitnessSerializer
    )

    const createdBoundWitness = await interaction.run(new MockNetworkPipe(
      clientSigners,
      [clientMockSignature1, clientMockSignature2],
      clientPayload,
      serializationService,
      [
        // tslint:disable:ter-indent
      // Buffer.from([
      //   0x04, 0x00, 0x00, 0x00, 0x01, // category headers
      //   0x20, // iterable-typed
      //   0x00, // bound-witness id
      //   0x23, // 35 elements
      //     0x30, // iterable-typed
      //     0x14, // typed-set
      //     0x0b, // 11 bytes
      //       0x20, // iterable-untyped
      //       0x15, // untypedSet
      //       0x08, // 8 bytes
      //         0x00, // not-iterable
      //         0x10, // stubPublicKey
      //         0x05, // 5 elements
      //           0x00,
      //           0x00,
      //           0x00,
      //           0x00,

      //       0x30, // iterable-untyped
      //       0x14, // typed-set
      //       0x10, // size 16
      //         0x30, // iterable-untyped
      //         0x03, // payload
      //         0x0d, // 13 elements
      //           0x20, // iterable-untyped
      //           0x15, // untypedSet
      //           0x05, // 5 elements
      //             0x00,
      //             0x04,
      //             0x02,
      //             0x00,
      //           0x05,
      //             0x00,
      //             0x16,
      //             0x02,
      //             0xf6,
      //       0x30, // iterable-untyped
      //       0x14, // typed-set
      //       0x01 // 1 element-self
      // ]),

      // Buffer.from([
      //   0x20,
      //   0x00,
      //   0x14,
      //     0x30,
      //     0x14,
      //     0x01,
      //     0x30,
      //     0x14,
      //     0x01,
      //     0x30,
      //     0x14,
      //     0x0b,
      //       0x20,
      //       0x15,
      //       0x08,
      //         0x00,
      //         0x1b,
      //         0x05,
      //         0x11,
      //         0x11,
      //         0x11,
      //         0x11
      // ])
    ]))

    const createdBytes = boundWitnessSerializer.serialize(createdBoundWitness, 'hex') as string
    const expectedBw = new MockBoundWitness(
      [
        [serverMockPublicKey], [clientMockPublicKey1, clientMockPublicKey2]
      ],
      [
        [serverMockSignature], [clientMockSignature1, clientMockSignature2]
      ],
      [
        serverPayload, clientPayload
      ],
    )
    const expectedBoundWitnessBytes = boundWitnessSerializer.serialize(expectedBw, 'hex') as string
    console.log(expectedBoundWitnessBytes)
    expect(createdBytes === expectedBoundWitnessBytes).toBe(true)
  })
})

class MockBoundWitness extends XyoBaseBoundWitness {
  constructor (
    public readonly publicKeys: IXyoPublicKey[][],
    public readonly signatures: IXyoSignature[][],
    public readonly payloads: IXyoPayload[]
  ) {
    super()
  }
}

// tslint:disable-next-line:max-classes-per-file
class MockNetworkPipe implements IXyoNetworkPipe {
  public sendCount = 0
  // @ts-ignore
  public peer: IXyoNetworkPeer = {}

  // @ts-ignore
  public otherCatalogue: CatalogueItem[]

  // @ts-ignore
  public initiationData: Buffer

  constructor(
    private readonly clientSigners: IXyoSigner[],
    private readonly mockSignatures: MockSignature[],
    private readonly clientPayload: MockPayload,
    private readonly serializationService: XyoSerializationService,
    private readonly expectedMessages: Buffer[]
  ) {

  }

  public onPeerDisconnect(callback: (hasError: boolean) => void): () => void {
    return () => {
      console.log(`called`)
    }
  }

  public async send(data: Buffer, awaitResponse?: boolean): Promise<Buffer> {
    console.log(this.sendCount, data.toString('hex'))
    const expected = this.expectedMessages.length > this.sendCount ? this.expectedMessages[this.sendCount] : undefined
    if (expected) {
      expect(expected.equals(data)).toBe(true)
    }

    this.sendCount += 1

    if (this.sendCount === 1) {
      return this.serializationService.serialize(new MockBoundWitness(
        [
          this.clientSigners.map(signer => signer.publicKey)
        ],
        [
          this.mockSignatures
        ],
        [
          this.clientPayload
        ]
      ), 'buffer') as Buffer
    }

    return Buffer.alloc(0)
  }

  public async close(): Promise<void> {
    return
  }
}

// tslint:disable-next-line:max-classes-per-file
class MockPayload extends XyoBasePayload {

  constructor (
    public readonly signedPayload: IXyoSerializableObject[],
    public readonly unsignedPayload: IXyoSerializableObject[]
  ) {
    super()
  }
}

// tslint:disable-next-line:max-classes-per-file
class MockSigner implements IXyoSigner {

  constructor (
    public readonly publicKey: MockPublicKey,
    public readonly signature: MockSignature
  ) {}

  get privateKey () {
    return 'abc'
  }

  public async signData(data: Buffer): Promise<IXyoSignature> {
    return this.signature
  }
}

// tslint:disable-next-line:max-classes-per-file
class MockPublicKey implements IXyoPublicKey {
  public schemaObjectId = 0x10

  constructor(private readonly publicKeyHexString: string) {}

  public getRawPublicKey(): Buffer {
    return Buffer.from(this.publicKeyHexString, 'hex')
  }

  public serialize(): Buffer {
    return this.getRawPublicKey()
  }
}

// tslint:disable-next-line:max-classes-per-file
class MockPublicKeyDeserializer implements IXyoDeserializer<MockPublicKey> {
  public schemaObjectId =  0x10
  public deserialize(data: Buffer, serializationService: IXyoSerializationService): MockPublicKey {
    const parseResult = parse(data)
    const q = new ParseQuery(parseResult)
    const dataBuffer = q.readData(false)
    return new MockPublicKey(dataBuffer.toString('hex'))
  }
}

// tslint:disable-next-line:max-classes-per-file
class MockSignature implements IXyoSignature {

  public schemaObjectId = 0x1b

  constructor (private readonly desiredSignatureHexString: string) {}

  public async verify(data: Buffer, publicKey: IXyoPublicKey): Promise<boolean> {
    return data.toString('hex') === this.desiredSignatureHexString
  }

  public get encodedSignature (): Buffer {
    return Buffer.from(this.desiredSignatureHexString, 'hex')
  }

  public serialize(): Buffer {
    return this.encodedSignature
  }
}
