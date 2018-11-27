/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 1:11:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 3:10:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessStandardServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { IXyoSigner, IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { XyoBasePayload, XyoBoundWitnessSigningService, IXyoBoundWitness, XyoBaseBoundWitness, IXyoPayload } from '@xyo-network/bound-witness'
import { IXyoSerializableObject, XyoSerializationService, BufferOrString } from '@xyo-network/serialization'
import { IXyoNetworkPipe, IXyoNetworkPeer, CatalogueItem } from '@xyo-network/network'

describe(`Bound Witness Interaction`, () => {
  it(`Should leave two parties with the same bound-witness data`, async () => {
    const serverSigners = [
      new MockSigner(
        new MockPublicKey('00000000'),
        new MockSignature('11111111')
      )
    ]

    const clientSigners = [
      new MockSigner(
        new MockPublicKey('22222222'),
        new MockSignature('33333333')
      )
    ]

    const serverPayload = new MockPayload(
      [
        {
          schemaObjectId: 0x04,
          serialize: () => {
            return Buffer.alloc(1)
          }
        }
      ],
      [
        {
          schemaObjectId: 0x16,
          serialize: () => {
            const b = Buffer.alloc(1)
            b.writeInt8(-10, 0)
            return b
          }
        }
      ]
    )

    const clientPayload = new MockPayload(
      [
        {
          schemaObjectId: 0x04,
          serialize: () => {
            return Buffer.alloc(1)
          }
        }
      ],
      [
        {
          schemaObjectId: 0x16,
          serialize: () => {
            const b = Buffer.alloc(1)
            b.writeInt8(-10, 0)
            return b
          }
        }
      ]
    )

    const signingService = new XyoBoundWitnessSigningService({
      getSigningData: (boundWitness: IXyoBoundWitness) => {
        return Buffer.alloc(4)
      }
    })

    const boundWitnessSerializer = new XyoSerializationService()
      .getInstanceOfTypeSerializer<IXyoBoundWitness>()

    let step = 0
    boundWitnessSerializer.deserialize = (deserializable: BufferOrString) => {
      step += 1
      if (step === 1) {
        return new MockBoundWitness(
          [
            clientSigners.map(signer => signer.publicKey)
          ],
          [
            [new MockSignature('33333333')]
          ],
          [
            clientPayload
          ]
        )
      }

      return new MockBoundWitness([], [], [])
    }

    const interaction = new XyoBoundWitnessStandardServerInteraction(
      serverSigners,
      serverPayload,
      signingService,
      boundWitnessSerializer
    )

    const createdBoundWitness = await interaction.run(new MockNetworkPipe([
        // tslint:disable:ter-indent
      Buffer.from([
        0x04, 0x00, 0x00, 0x00, 0x01, // category headers
        0x20, // iterable-typed
        0x00, // bound-witness id
        0x23, // 35 elements
          0x30, // iterable-typed
          0x14, // typed-set
          0x0b, // 11 bytes
            0x20, // iterable-untyped
            0x15, // untypedSet
            0x08, // 8 bytes
              0x00, // not-iterable
              0x10, // stubPublicKey
              0x05, // 5 elements
                0x00,
                0x00,
                0x00,
                0x00,

            0x30, // iterable-untyped
            0x14, // typed-set
            0x10, // size 16
              0x30, // iterable-untyped
              0x03, // payload
              0x0d, // 13 elements
                0x20, // iterable-untyped
                0x15, // untypedSet
                0x05, // 5 elements
                  0x00,
                  0x04,
                  0x02,
                  0x00,
                0x05,
                  0x00,
                  0x16,
                  0x02,
                  0xf6,
            0x30, // iterable-untyped
            0x14, // typed-set
            0x01 // 1 element-self
      ]),

      Buffer.from([
        0x20,
        0x00,
        0x14,
          0x30,
          0x14,
          0x01,
          0x30,
          0x14,
          0x01,
          0x30,
          0x14,
          0x0b,
            0x20,
            0x15,
            0x08,
              0x00,
              0x1b,
              0x05,
              0x11,
              0x11,
              0x11,
              0x11
      ])
    ]))

    const createdBytes = boundWitnessSerializer.serialize(createdBoundWitness, 'hex') as string
    const expectedBw = new MockBoundWitness(
      [
        [new MockPublicKey('00000000')], [new MockPublicKey('22222222')]
      ],
      [
        [new MockSignature('11111111')], [new MockSignature('33333333')]
      ],
      [
        serverPayload, clientPayload
      ],
    )
    const expectedBoundWitnessBytes = boundWitnessSerializer.serialize(expectedBw, 'hex') as string
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

  constructor(private readonly expectedMessages: Buffer[]) {

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
