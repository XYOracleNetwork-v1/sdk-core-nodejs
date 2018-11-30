/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 1:11:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: bound-witness.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 4:47:41 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessStandardServerInteraction } from '@xyo-network/peer-interaction-handlers'
import { XyoBoundWitnessSigningService, IXyoBoundWitness } from '@xyo-network/bound-witness'
import { XyoSerializationService } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'
import { XyoSerializableNumber } from '@xyo-network/serializers'
import { XyoMockNetworkPipe, XyoMockBoundWitness, XyoMockPayload, XyoMockSigner, XyoMockPublicKey, XyoMockSignature } from '@xyo-network/test-utils'
import { recipes } from '../xyo-serialization-recipes'

describe(`Bound Witness Interaction`, () => {
  it(`Should leave two parties with the same bound-witness data`, async () => {
    const serverMockPublicKey = new XyoMockPublicKey('00000000')
    const serverMockSignature = new XyoMockSignature('11111111')
    const serverMockSigner = new XyoMockSigner(
      serverMockPublicKey,
      serverMockSignature
    )
    const serverSigners = [serverMockSigner]

    const clientMockPublicKey1 = new XyoMockPublicKey('22222222')
    const clientMockPublicKey2 = new XyoMockPublicKey('44444444')
    const clientMockSignature1 = new XyoMockSignature('33333333')
    const clientMockSignature2 = new XyoMockSignature('55555555')

    const clientMockSigner1 = new XyoMockSigner(
      clientMockPublicKey1,
      clientMockSignature1
    )

    const clientMockSigner2 = new XyoMockSigner(
      clientMockPublicKey2,
      clientMockSignature2
    )
    const clientSigners = [clientMockSigner1, clientMockSigner2]

    const serverPayload = new XyoMockPayload(
      [
        new XyoSerializableNumber(0, false, schema.index.id)
      ],
      [
        new XyoSerializableNumber(-10, true, schema.rssi.id)
      ]
    )

    const clientPayload = new XyoMockPayload(
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

    const serializationService = new XyoSerializationService(schema, recipes)

    const boundWitnessSerializer = serializationService.getInstanceOfTypeSerializer<IXyoBoundWitness>()

    const interaction = new XyoBoundWitnessStandardServerInteraction(
      serverSigners,
      serverPayload,
      signingService,
      boundWitnessSerializer
    )

    const createdBoundWitness = await interaction.run(new XyoMockNetworkPipe(
      {
        0: async () => {
          return serializationService.serialize(new XyoMockBoundWitness(
            [
              clientSigners.map(signer => signer.publicKey)
            ],
            [
              [clientMockSignature1, clientMockSignature2]
            ],
            [
              clientPayload
            ]
          ), 'buffer') as Buffer
        }
      },
      []
    ))

    const createdBytes = boundWitnessSerializer.serialize(createdBoundWitness, 'hex') as string
    const expectedBw = new XyoMockBoundWitness(
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
