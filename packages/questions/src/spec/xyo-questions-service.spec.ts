/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 24th January 2019 1:14:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-questions-service.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 7th March 2019 4:42:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoQuestionService } from '../xyo-question-service'
import { IBlockPermissionRequestResolver, IRequestPermissionForBlockResult } from '@xyo-network/attribution-request'
import { IXyoOriginBlockRepository } from '@xyo-network/origin-block-repository'
import { IXyoOriginChainRepository, XyoIndex, XyoPreviousHash, XyoBridgeHashSet } from '@xyo-network/origin-chain'
import { IXyoHasIntersectedQuestion } from '../@types'
import { XyoStubHash, IXyoHash } from '@xyo-network/hashing'
import { IXyoBoundWitness, XyoBoundWitness, XyoKeySet, XyoFetter, XyoSignatureSet, XyoWitness } from '@xyo-network/bound-witness'
import { XyoStubPublicKey, XyoStubSignature, XyoStubSigner } from '@xyo-network/signing'
import { IXyoArchivistNetwork } from '@xyo-network/archivist-network'
import { XyoBoundWitnessPayloadProvider } from '@xyo-network/peer-interaction'

describe('Questions Service', () => {
  it('Should not provide an answer if no supporting data exists', async () => {
    const hashes = [new XyoStubHash(Buffer.from('aabbccdd'))]
    const originBlockRepo = await getOriginBlockRepository({})
    const originChainRepository = await getOriginChainRepository([])
    const archivistNetwork = await getArchivistNetwork()
    const blockPermissionsRequestResolver = await getBlockPermissionsRequestsResolver({})

    const questionService = new XyoQuestionService(
      originBlockRepo,
      originChainRepository,
      archivistNetwork,
      blockPermissionsRequestResolver
    )

    const question: IXyoHasIntersectedQuestion = {
      partyOne: ['abc'],
      partyTwo: ['def'],
      markers: [],
      direction: 'FORWARD'
    }

    const result = await questionService.buildProofOfIntersection(question, hashes)
    expect(result).toBe(undefined)
  })

  it('Should provide an answer if block is in own origin-chain', async () => {
    const boundWitnesses = await getBoundWitnesses()
    const originBlockRepo = await getOriginBlockRepository({
      [boundWitnesses[1].hash.serializeHex()]: boundWitnesses[1].block
    })

    const originChainRepository = await getOriginChainRepository(
      boundWitnesses.map((bw) => {
        return { hash: bw.hash, indexInBlock: 0 }
      })
    )

    const archivistNetwork = await getArchivistNetwork()
    const blockPermissionsRequestResolver = await getBlockPermissionsRequestsResolver({})

    const questionService = new XyoQuestionService(
      originBlockRepo,
      originChainRepository,
      archivistNetwork,
      blockPermissionsRequestResolver
    )

    const question: IXyoHasIntersectedQuestion = {
      partyOne: [boundWitnesses[1].block.parties[0].keySet.keys[0].serializeHex()],
      partyTwo: [boundWitnesses[1].block.parties[1].keySet.keys[0].serializeHex()],
      markers: [],
      direction: 'FORWARD'
    }

    const result = await questionService.buildProofOfIntersection(question, [boundWitnesses[1].hash])
    expect(result === undefined).toBe(false)
    expect(result!.answer.hash).toBe(boundWitnesses[1].hash.serializeHex())
    expect(result!.answer.proofOfIdentities.length).toBe(2)
    expect(result!.answer.proofOfIdentities[0].length).toBe(0)
    expect(result!.answer.proofOfIdentities[1].length).toBe(0)
    expect(result!.answer.transfers.length).toBe(0)
  })

  it('Should build proof of intersection for a block that is not in the diviners origin chain', async () => {
    // There will be 2 sentinels, s1 and s2, that create a block together (bw1), s2 will bridge that block to
    // a bridge b1 in block (bw2), furthermore, the bridge bridges the block an archivist a1
    // The diviner will build a proof of intersection by at run-time creating a bound-witness with
    // the bridge in bw3.

    // Create public keys for all parties
    const s1PublicKey = new XyoStubPublicKey('00000001')
    const s2PublicKey = new XyoStubPublicKey('00000002')
    const b1PublicKey = new XyoStubPublicKey('00000003')
    const a1PublicKey = new XyoStubPublicKey('00000004')
    const d1PublicKey = new XyoStubPublicKey('00000005')

    // Build BoundWitness 1: bw1
    const fetterS1BW1 = new XyoFetter(new XyoKeySet([s1PublicKey]), [new XyoIndex(0)])
    const fetterS2BW1 = new XyoFetter(new XyoKeySet([s2PublicKey]), [new XyoIndex(0)])
    const witnessS1BW1 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('ABCD')]), [])
    const witnessS2BW1 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('DCBA')]), [])
    const bw1 = new XyoBoundWitness([
      fetterS1BW1,
      fetterS2BW1,
      witnessS2BW1,
      witnessS1BW1
    ])

    const bw1Hash = new XyoStubHash(Buffer.from('bw1Hash'))

    const fetterS2BW2 = new XyoFetter(
      new XyoKeySet([s2PublicKey]),
      [
        new XyoIndex(1),
        new XyoPreviousHash(bw1Hash),
        new XyoBridgeHashSet([bw1Hash])
      ]
    )

    const fetterB1BW2 = new XyoFetter(new XyoKeySet([b1PublicKey]), [new XyoIndex(0)])
    const witnessS2BW2 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('ABCD')]), [])
    const witnessB1BW2 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('DCBA')]), [])

    const bw2 = new XyoBoundWitness([
      fetterS2BW2,
      fetterB1BW2,
      witnessB1BW2,
      witnessS2BW2
    ])

    const bw2Hash = new XyoStubHash(Buffer.from('bw2Hash'))

    const fetterB1BW3 = new XyoFetter(
      new XyoKeySet([b1PublicKey]),
      [
        new XyoIndex(1),
        new XyoPreviousHash(bw2Hash),
        new XyoBridgeHashSet([bw1Hash])
      ]
    )
    const fetterA1BW3 = new XyoFetter(new XyoKeySet([a1PublicKey]), [new XyoIndex(0)])
    const witnessB1BW3 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('ABCD')]), [])
    const witnessA1BW3 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('DCBA')]), [])

    const bw3 = new XyoBoundWitness([
      fetterB1BW3,
      fetterA1BW3,
      witnessA1BW3,
      witnessB1BW3
    ])

    const bw3Hash = new XyoStubHash(Buffer.from('bw3Hash'))

    const fetterA1BW4 = new XyoFetter(
      new XyoKeySet([a1PublicKey]),
      [
        new XyoIndex(1),
        new XyoPreviousHash(bw3Hash),
        new XyoBridgeHashSet([bw1Hash])
      ]
    )

    const fetterD1BW4 = new XyoFetter(new XyoKeySet([d1PublicKey]), [new XyoIndex(0)])
    const witnessA1BW4 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('ABCD')]), [])
    const witnessD1BW4 = new XyoWitness(new XyoSignatureSet([new XyoStubSignature('DCBA')]), [])

    const bw4 = new XyoBoundWitness([
      fetterA1BW4,
      fetterD1BW4,
      witnessA1BW4,
      witnessD1BW4
    ])

    const bw4Hash = new XyoStubHash(Buffer.from('bw4Hash'))

    const originBlockRepo = await getOriginBlockRepository({
      [bw1Hash.serializeHex()]: bw1
    })

    const originChainRepository = await getOriginChainRepository([])

    const archivistNetwork = await getArchivistNetwork()
    const blockPermissionsRequestResolver = await getBlockPermissionsRequestsResolver({
      [bw1Hash.serializeHex()]: {
        newBoundWitnessHash: bw4Hash,
        partyIndex: 1,
        supportingData: {
          [bw1Hash.serializeHex()] : bw1,
          [bw2Hash.serializeHex()] : bw2,
          [bw3Hash.serializeHex()] : bw3,
          [bw4Hash.serializeHex()] : bw4,
        }
      }
    })

    const questionService = new XyoQuestionService(
      originBlockRepo,
      originChainRepository,
      archivistNetwork,
      blockPermissionsRequestResolver
    )

    const question: IXyoHasIntersectedQuestion = {
      partyOne: [s1PublicKey.serializeHex()],
      partyTwo: [s2PublicKey.serializeHex()],
      markers: [],
      direction: 'FORWARD'
    }

    const result = await questionService.buildProofOfIntersection(question, [bw1Hash])
    expect(result === undefined).toBe(false)
    expect(result!.answer.hash).toBe(bw1Hash.serializeHex())
    expect(result!.answer.proofOfIdentities.length).toBe(2)
    expect(result!.answer.transfers[0].hash).toBe(bw2Hash.serializeHex())
    expect(result!.answer.transfers[1].hash).toBe(bw3Hash.serializeHex())
    expect(result!.answer.transfers[2].hash).toBe(bw4Hash.serializeHex())
  })
})

async function getBoundWitnesses() {
  const genesisPublicKey = new XyoStubPublicKey('aabbccdd')
  const genesisSig = new XyoStubSignature('ddccbbaa')
  const originChainSigner = new XyoStubSigner(genesisPublicKey, genesisSig)
  const genesisHash = new XyoStubHash(Buffer.from('xxyyzz'))

  const keyset = new XyoKeySet([originChainSigner.publicKey])
  const heuristics = [new XyoIndex(0)]
  const fetter = new XyoFetter(keyset, heuristics)

  const genesisSignatureSet = new XyoSignatureSet([genesisSig])
  const witness = new XyoWitness(genesisSignatureSet, [])
  const genesisBlock = new XyoBoundWitness([fetter, witness])

  const secondFetterA = new XyoFetter(keyset, [
    new XyoPreviousHash(genesisHash),
    new XyoIndex(1)
  ])

  const secondFetterB = new XyoFetter(
    new XyoKeySet([new XyoStubPublicKey('5544332211')]),
    [
      new XyoPreviousHash(new XyoStubHash(Buffer.from('it no matter'))),
      new XyoIndex(1)
    ]
  )

  const secondWitnessA = new XyoWitness(new XyoSignatureSet([]), [])
  const secondWitnessB = new XyoWitness(new XyoSignatureSet([]), [])

  const secondBlock = new XyoBoundWitness([
    secondFetterA,
    secondFetterB,
    secondWitnessB,
    secondWitnessA,
  ])

  return [
    {
      block: genesisBlock,
      hash: genesisHash
    },
    {
      block: secondBlock,
      hash: new XyoStubHash(Buffer.from('zzyyxx'))
    }
  ]
}

async function getOriginBlockRepository(
  hashToBlockMap: {[h: string]: IXyoBoundWitness}
): Promise<IXyoOriginBlockRepository> {
  // @ts-ignore
  return {
    getOriginBlockByHash: async (hash) => {
      return hashToBlockMap[hash.toString('hex')]
    }
  }
}

async function getOriginChainRepository(
  blocksInOriginChain: IOriginChainMockInput[]
): Promise<IXyoOriginChainRepository> {
  // @ts-ignore
  return {
    isBlockInOriginChain: async (block, hash) => {
      const res = blocksInOriginChain.find(b => b.hash.isEqual(hash))
      return {
        result: res !== undefined,
        indexOfPartyInBlock: res !== undefined ? res.indexInBlock : undefined
      }
    },
    getSigners: async () => [],
    getPreviousHash: async () => undefined,
    getIndex: async () => 0,
    getNextPublicKey: async () => undefined
  }
}

async function getArchivistNetwork(): Promise<IXyoArchivistNetwork> {
  // @ts-ignore
  return undefined // Dont need to mock
}

async function getBlockPermissionsRequestsResolver(
  blockPermissionsMap: {[s: string]: IRequestPermissionForBlockResult}
): Promise<IBlockPermissionRequestResolver> {
  return {
    requestPermissionForBlock: async (hash: IXyoHash) => {
      return blockPermissionsMap[hash.serializeHex()]
    }
  }
}

interface IOriginChainMockInput {hash: IXyoHash, indexInBlock: number}
