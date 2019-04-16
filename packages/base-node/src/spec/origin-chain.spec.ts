/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 14th December 2018 12:53:13 pm
 * @Email:  developer@xyfindables.com
 * @Filename: origin-chain.spec.ts
 
 * @Last modified time: Wednesday, 30th January 2019 11:06:29 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoStubHash } from '@xyo-network/hashing'
import { XyoStubSigner, XyoStubPublicKey, XyoStubSignature } from '@xyo-network/signing'
import { XyoBoundWitness, XyoFetter, XyoKeySet, XyoWitness, XyoSignatureSet } from '@xyo-network/bound-witness'
import { XyoIndex, XyoPreviousHash, XyoOriginChainStateInMemoryRepository } from '@xyo-network/origin-chain'
import { serializer } from '@xyo-network/serializer'

describe(`OriginChain`, () => {
  it(`Should update origin chain`, async () => {
    const originChainSigner = new XyoStubSigner(new XyoStubPublicKey('aabbccdd'), new XyoStubSignature("ddccbbaa"))
    const repo = new XyoOriginChainStateInMemoryRepository(
      0,
      [],
      [],
      {
        getOriginBlockByHash: async () => undefined
      },
      [originChainSigner],
      undefined,
      [],
      serializer,
      originChainSigner
    )

    let index = await repo.getIndex()
    expect(index).toBe(0)

    const signer = await repo.getGenesisSigner()
    expect(signer!.isEqual(originChainSigner)).toBe(true)

    const nextPublicKey = await repo.getNextPublicKey()
    expect(nextPublicKey).toBe(undefined)

    const previousHash = await repo.getPreviousHash()
    expect(previousHash).toBe(undefined)

    const hash = new XyoStubHash(Buffer.from([0x00]))
    await repo.updateOriginChainState(hash, new XyoBoundWitness([]))
    index = await repo.getIndex()
    expect(index).toBe(1)
    expect((await repo.getPreviousHash())!.isEqual(hash)).toBe(true)

    const newSigner = new XyoStubSigner(new XyoStubPublicKey('11223344'), new XyoStubSignature("44332211"))
    await repo.addSigner(newSigner)
    console.log((await repo.getNextPublicKey())!.isEqual(new XyoStubPublicKey('11223344')))
  })

  it('Should track publicKeys of parties communicated with', async () => {
    const genesisPublicKey = new XyoStubPublicKey('aabbccdd')
    const genesisSig = new XyoStubSignature("ddccbbaa")
    const originChainSigner = new XyoStubSigner(genesisPublicKey, genesisSig)
    const genesisHash = new XyoStubHash(Buffer.from('xxyyzz'))

    const keyset = new XyoKeySet([originChainSigner.publicKey])
    const heuristics = [new XyoIndex(0)]
    const fetter = new XyoFetter(keyset, heuristics)

    const genesisSignatureSet = new XyoSignatureSet([genesisSig])
    const witness = new XyoWitness(genesisSignatureSet, [])
    const genesisBlock = new XyoBoundWitness([fetter, witness])
    const repo = new XyoOriginChainStateInMemoryRepository(
      0,
      [genesisHash],
      [genesisPublicKey],
      {
        getOriginBlockByHash: async (hash: Buffer) => {
          return (hash.toString().indexOf('xxyyzz') !== -1) ? genesisBlock : undefined
        }
      },
      [originChainSigner],
      undefined,
      [],
      serializer,
      originChainSigner
    )

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
      secondWitnessA,
      secondWitnessB
    ])

    const secondHash = new XyoStubHash(Buffer.from('hello world'))
    await repo.updateOriginChainState(secondHash, secondBlock)

    const allHashes = await repo.getOriginChainHashes()
    expect(allHashes.length).toBe(2)
    const interactions = await repo.getInteractionWithPublicKey(new XyoStubPublicKey('5544332211'))
    expect(interactions.length).toBe(1)
    expect(interactions[0].isEqual(secondHash)).toBe(true)

    const nonInteractions = await repo.getInteractionWithPublicKey(new XyoStubPublicKey('1122334455'))
    expect(nonInteractions.length).toBe(0)
  })
})
