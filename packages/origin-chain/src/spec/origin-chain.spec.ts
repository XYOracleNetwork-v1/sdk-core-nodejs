/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 12:53:13 pm
 * @Email:  developer@xyfindables.com
 * @Filename: origin-chain.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 14th December 2018 1:14:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoOriginChainStateInMemoryRepository } from '../xyo-origin-chain-in-memory-repository'
import { XyoStubHash } from '@xyo-network/hashing'
import { XyoStubSigner, XyoStubPublicKey, XyoStubSignature } from '@xyo-network/signing'

describe(`OriginChain`, () => {
  it(`Should update origin chain`, async () => {
    const originChainSigner = new XyoStubSigner(new XyoStubPublicKey('aabbccdd'), new XyoStubSignature("ddccbbaa"))
    const repo = new XyoOriginChainStateInMemoryRepository(
      0,
      undefined,
      [originChainSigner],
      undefined,
      [],
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
    await repo.updateOriginChainState(hash)
    index = await repo.getIndex()
    expect(index).toBe(1)
    expect((await repo.getPreviousHash())!.isEqual(hash)).toBe(true)

    const newSigner = new XyoStubSigner(new XyoStubPublicKey('11223344'), new XyoStubSignature("44332211"))
    await repo.addSigner(newSigner)
    console.log((await repo.getNextPublicKey())!.isEqual(new XyoStubPublicKey('11223344')))
  })
})
