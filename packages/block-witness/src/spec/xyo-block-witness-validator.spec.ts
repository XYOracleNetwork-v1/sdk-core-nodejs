/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 7th March 2019 12:06:28 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-witness-validator.spec.ts

 * @Last modified time: Monday, 11th March 2019 1:11:55 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

describe('XyoBlockWitnessValidator', () => {
  it('Has no test yet', async () => {
    expect(true).toBe(true)
  })
})

// import { XyoBlockWitnessValidator } from '../xyo-block-witness-validator'
// import { BN } from '@xyo-network/utils'
// import { getHashingProvider, IXyoHashProvider, XyoStubHash } from '@xyo-network/hashing'
// import {
//   XyoBoundWitness,
//   XyoKeySet,
//   XyoFetter,
//   XyoSignatureSet,
//   XyoWitness,
//   XyoBoundWitnessValidator
// } from '@xyo-network/bound-witness'
// import { XyoIndex, XyoPreviousHash, XyoBridgeHashSet, XyoBridgeBlockSet } from '@xyo-network/origin-chain'
// import { getSignerProvider } from '@xyo-network/signing.ecdsa'
// import { serializer } from '@xyo-network/serializer'
// import { IConsensusProvider } from '@xyo-network/consensus'
// import { IXyoContentAddressableService, XyoLocalContentService } from '@xyo-network/content-addressable-service'
// import { XyoInMemoryStorageProvider } from '@xyo-network/storage'

// describe(`XyoBlockWitnessValidator`, () => {

//   it(`Should throw an error if it can not resolve the data`, async () => {
//     const sha256 = getHashingProvider('sha256')
//     const blockHash = new BN(1000)
//     const hashCalls = jest.fn()
//     const bogusHash = await sha256.createHash(Buffer.from('something'))
//     const validator = new XyoBlockWitnessValidator(
//       new MockContentService({}, sha256, hashCalls),
//       serializer,
//       sha256,
//       getBoundWitnessValidator(),
//       await getConsensus(blockHash)
//     )

//     const previousBlockHash = new BN(999)
//     const blockHeight = new BN(2000)
//     const requests = [new BN(50000)]
//     const responses = Buffer.alloc(0, 1)
//     let error: Error | undefined
//     try {
//       await validator.validate(
//         blockHash,
//         blockHeight,
//         previousBlockHash,
//         bogusHash.getHash(),
//         requests,
//         responses
//       )
//     } catch (e) {
//       error = e
//     }
//     expect(bogusHash.getHash().toString('hex')).toBe(hashCalls.mock.calls[0][0])
//     expect(error === undefined).toBe(false)
//   })

//   it(`Should validate simple case of no bridge blocks`, async () => {
//     const sha256 = getHashingProvider('sha256')
//     const bw = await createBoundWitness()

//     const request: IIntersectionRequest = {
//       xyoBounty: 100,
//       xyoPayOnDelivery: 200,
//       weiPayOnDelivery: 300,
//       beneficiary: '0x0011223344556677889900112233445566778899',
//       type: 'intersection',
//       data: {
//         partyOne: [
//           bw.boundWitness.parties[0].keySet.keys[0].serializeHex()
//         ],
//         partyTwo: [
//           bw.boundWitness.parties[1].keySet.keys[0].serializeHex()
//         ],
//         markers: [],
//         direction: null
//       }
//     }
//     const req = JSON.stringify(request)
//     const reqHash = await sha256.createHash(Buffer.from(req))
//     const bwHash = await sha256.createHash(bw.boundWitness.serialize())
//     const supportingDataItem: IProofOfIntersectionAnswer = {
//       hash: bwHash.getHash().toString('hex'),
//       proofOfIdentities: [],
//       transfers: []
//     }

//     const supportingData = [supportingDataItem]
//     const jsonSupportDataBuf = Buffer.from(JSON.stringify(supportingData))
//     const supportingDataHash = await sha256.createHash(jsonSupportDataBuf)
//     const hashCalls = jest.fn()
//     const blockHash = new BN(1000)

//     const validator = new XyoBlockWitnessValidator(
//       new MockContentService({
//         [supportingDataHash.getHash().toString('hex')]: jsonSupportDataBuf,
//         [bwHash.getHash().toString('hex')]: bw.boundWitness.serialize(),
//         [reqHash.getHash().toString('hex')]: Buffer.from(req)
//       }, sha256, hashCalls),
//       serializer,
//       sha256,
//       getBoundWitnessValidator(),
//       await getConsensus(blockHash)
//     )

//     const previousBlockHash = new BN(999)
//     const blockHeight = new BN(2000)
//     const requests = [new BN(reqHash.getHash())]
//     const responses = Buffer.alloc(1, 1)
//     const validationResult = await validator.validate(
//       blockHash,
//       blockHeight,
//       previousBlockHash,
//       supportingDataHash.getHash(),
//       requests,
//       responses
//     )

//     expect(supportingDataHash.getHash().toString('hex')).toBe(hashCalls.mock.calls[0][0])
//     expect(validationResult).toBe(true)
//   })

//   it(`Should validate a transaction with a bridge block`, async () => {
//     const sha256 = getHashingProvider('sha256')
//     const bw = await createBoundWitness()
//     const bridgedBw = (
//       bw.boundWitness.parties[0].metadata[0] as XyoBridgeBlockSet
//     )
//     .boundWitnesses[0]

//     const request: IIntersectionRequest = {
//       xyoBounty: 100,
//       xyoPayOnDelivery: 200,
//       weiPayOnDelivery: 300,
//       beneficiary: '0x0011223344556677889900112233445566778899',
//       type: 'intersection',
//       data: {
//         partyOne: [
//           bridgedBw.parties[0].keySet.keys[0].serializeHex()
//         ],
//         partyTwo: [
//           bridgedBw.parties[1].keySet.keys[0].serializeHex()
//         ],
//         markers: [],
//         direction: null
//       }
//     }
//     const req = JSON.stringify(request)
//     const reqHash = await sha256.createHash(Buffer.from(req))
//     const bwHash = await sha256.createHash(bridgedBw.stripMetaData().serialize())
//     const bridgerBwHash = await sha256.createHash(bw.boundWitness.stripMetaData().serialize())
//     const supportingDataItem: IProofOfIntersectionAnswer = {
//       hash: bwHash.getHash().toString('hex'),
//       proofOfIdentities: [],
//       transfers: [{
//         hash: bridgerBwHash.getHash().toString('hex'),
//         proofOfIdentityFrom: []
//       }]
//     }

//     const supportingData = [supportingDataItem]
//     const jsonSupportDataBuf = Buffer.from(JSON.stringify(supportingData))
//     const supportingDataHash = await sha256.createHash(jsonSupportDataBuf)
//     const hashCalls = jest.fn()
//     const blockHash = new BN(1000)

//     const validator = new XyoBlockWitnessValidator(
//       new MockContentService({
//         [supportingDataHash.getHash().toString('hex')]: jsonSupportDataBuf,
//         [bwHash.getHash().toString('hex')]: bridgedBw.stripMetaData().serialize(),
//         [bridgerBwHash.getHash().toString('hex')]: bw.boundWitness.stripMetaData().serialize(),
//         [reqHash.getHash().toString('hex')]: Buffer.from(req)
//       }, sha256, hashCalls),
//       serializer,
//       sha256,
//       getBoundWitnessValidator(),
//       await getConsensus(blockHash)
//     )

//     const previousBlockHash = new BN(999)
//     const blockHeight = new BN(2000)
//     const requests = [new BN(reqHash.getHash())]
//     const responses = Buffer.alloc(1, 1)
//     const validationResult = await validator.validate(
//       blockHash,
//       blockHeight,
//       previousBlockHash,
//       supportingDataHash.getHash(),
//       requests,
//       responses
//     )

//     expect(validationResult).toBe(true)
//   })

// })

// class MockContentService extends XyoLocalContentService implements IXyoContentAddressableService {

//   constructor(
//     data: {[s: string]: Buffer},
//     hashProvider: IXyoHashProvider,
//     private readonly calls: jest.Mock<any, any>
//   ) {
//     super(
//       hashProvider,
//       new XyoInMemoryStorageProvider(data),
//     )
//   }

//   public async get(context: string): Promise<Buffer | undefined> {
//     this.calls(context)
//     return super.get(context)
//   }
// }

// function getBoundWitnessValidator() {
//   return new XyoBoundWitnessValidator({
//     checkCountOfSignaturesMatchPublicKeysCount: true,
//     checkPartyLengths: true,
//     checkIndexExists: true,
//     validateSignatures: true,
//     validateHash: true
//   })
// }

// async function getConsensus(mockEncodeBlock: BN): Promise<IConsensusProvider> {
//   // @ts-ignore
//   const c: IConsensusProvider = {
//     encodeBlock: async () => mockEncodeBlock
//   }

//   return c
// }

// async function createBoundWitness() {
//   const signerProvider = getSignerProvider('secp256k1-sha256')
//   const signer = signerProvider.newInstance()
//   const genesisPublicKey = signer.publicKey

//   const keyset = new XyoKeySet([genesisPublicKey])
//   const heuristics = [new XyoIndex(0)]
//   const fetter = new XyoFetter(keyset, heuristics)

//   const genesisSig = await signer.signData(fetter.serialize())
//   const genesisSignatureSet = new XyoSignatureSet([genesisSig])
//   const witness = new XyoWitness(genesisSignatureSet, [])
//   const genesisBlock = new XyoBoundWitness([fetter, witness])
//   const genesisHash = await getHashingProvider('sha256').createHash(genesisBlock.getSigningData())
//   const secondFetterAHash = new XyoPreviousHash(genesisHash)
//   const secondFetterA = new XyoFetter(keyset, [
//     secondFetterAHash,
//     new XyoIndex(1)
//   ])

//   const secondParty = signerProvider.newInstance()

//   const secondFetterB = new XyoFetter(
//     new XyoKeySet([secondParty.publicKey]),
//     [
//       new XyoPreviousHash(new XyoStubHash(Buffer.from('it no matter'))),
//       new XyoIndex(1)
//     ]
//   )

//   const signingDataSecond = Buffer.concat([
//     secondFetterA.serialize(),
//     secondFetterB.serialize()
//   ])

//   const sigSecondA = await signer.signData(signingDataSecond)
//   const sigSecondB = await secondParty.signData(signingDataSecond)

//   const secondWitnessA = new XyoWitness(new XyoSignatureSet([sigSecondA]), [])
//   const secondWitnessB = new XyoWitness(new XyoSignatureSet([sigSecondB]), [])

//   const secondBlock = new XyoBoundWitness([
//     secondFetterA,
//     secondFetterB,
//     secondWitnessB,
//     secondWitnessA,
//   ])

//   const secondHash = await getHashingProvider('sha256')
//     .createHash(secondBlock.getSigningData())

//   const thirdFetterAHash = new XyoPreviousHash(secondHash)
//   const thirdFetterA = new XyoFetter(keyset, [
//     thirdFetterAHash,
//     new XyoIndex(2),
//     new XyoBridgeHashSet([secondHash])
//   ])

//   const thirdParty = signerProvider.newInstance()
//   const thirdFetterB = new XyoFetter(
//     new XyoKeySet([thirdParty.publicKey]),
//     [
//       new XyoPreviousHash(new XyoStubHash(Buffer.from('it no matter either'))),
//       new XyoIndex(1)
//     ]
//   )

//   const signingDataThird = Buffer.concat([
//     thirdFetterA.serialize(),
//     thirdFetterB.serialize()
//   ])

//   const sigThirdA = await signer.signData(signingDataThird)
//   const sigThirdB = await thirdParty.signData(signingDataThird)

//   const thirdWitnessA = new XyoWitness(new XyoSignatureSet([sigThirdA]), [
//     new XyoBridgeBlockSet([secondBlock])
//   ])

//   const thirdWitnessB = new XyoWitness(new XyoSignatureSet([sigThirdB]), [])

//   const thirdBlock = new XyoBoundWitness([
//     thirdFetterA,
//     thirdFetterB,
//     thirdWitnessB,
//     thirdWitnessA,
//   ])

//   const thirdHash = await getHashingProvider('sha256')
//     .createHash(thirdBlock.getSigningData())

//   return { boundWitness: thirdBlock, hash: thirdHash }

// }
