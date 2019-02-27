/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 25th February 2019 10:20:31 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-scsc-consensus-provider.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 25th February 2019 10:40:56 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoScscConsensusProvider } from '../xyo-scsc-consensus-provider'
import { XyoWeb3Service } from '@xyo-network/web3-service'
import { resolve } from 'path'
import BigNumber from 'bignumber.js'
jest.setTimeout(1000000)
describe('Consensus', async () => {
  let consensus: any
  const account = '0x3D01dDdB4eBD0b521f0E4022DCbeF3cb9bc20FF2'

  beforeEach(async () => {
    const host = 'http://127.0.0.1:8545'
    const web3Service = new XyoWeb3Service(host, account, {
      XyStakingConsensus: {
        ipfsHash: "QmUNY6fjGthi9W8gq9BvhWtPU5W1WEgJk2yt9sgXNcFChD",
        address: '0x567306106febB682f04BB97cb0e1a4902c60B096',
      }, XyStakableToken: {
        ipfsHash: "QmezVKUQ8BRK9jdEwxgNR1Xij4oqppMaGNsid7QnrBYszY",
        address: '0xf30742B61037dDD900f1B5caa358A1B311D9a375',
      }, XyGovernance: {
        ipfsHash: "QmP8V44TaQc6PAYF53zWgEsTU9AsawoPpbZ1p1Hio5kdfN",
        address: '0x60C7F7cDF4a71f2e5658448CBfd5E4C377e39877',
      }
    })
    consensus = new XyoScscConsensusProvider(web3Service)
  })
  async function delay(delayInms: number) {
// tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2)
      }, delayInms)
    })
  }

  describe("SCSC", () => {
    it('Should get request by id', async () => {
      const req = await consensus.getRequestById(1)
      console.log("getRequestById", req)
      expect(req.requestSender).toEqual(account)

      // let huh2 = await consensus.getRequestById(2)
      // console.log("2nd time works?", huh2)
      // await delay(100);

      // let huh3 = await consensus.getRequestById(3)
      // console.log("how bout 3?", huh3)
      // await delay(100);

    })
    it('Should get all requests', async () => {
      const allR = await consensus.getAllRequests()
      console.log("getAllRequests", allR)
      expect(allR[1].requestSender).toEqual(account)
    })

    it('Should get last block hash', async () => {

      const result = await consensus.getLatestBlockHash()
      console.log("getLatestBlockHash", result)
      expect(result).toEqual("0")
    })
    it('getNetworkActiveStake', async () => {

      const result = await consensus.getNetworkActiveStake()
      console.log("getNetworkActiveStake", result)
      expect(result.toString()).toEqual("0")
    })
    it('getStakerActiveStake', async () => {

      const result = await consensus.getStakerActiveStake(1, account)
      console.log("getStakerActiveStake", result)
      expect(result.toString()).toEqual("0")
    })
    it('isBlockProducer', async () => {
      const result = await consensus.isBlockProducer(1)
      console.log("isBlockProducer", result)
      expect(result).toEqual(false)
    })
    it('getRewardPercentages', async () => {
      const result = await consensus.getRewardPercentages()
      console.log("getRewardPercentages", result)
      // expect(result).toEqual(false)
    })
  })

})
