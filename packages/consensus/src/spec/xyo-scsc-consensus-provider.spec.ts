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
jest.setTimeout(1000000)
describe('Consensus', async () => {
  let consensus: any
  beforeEach(async () => {
    const host = 'http://127.0.0.1:8545'
    const account = '0x3D01dDdB4eBD0b521f0E4022DCbeF3cb9bc20FF2'
    const web3Service = new XyoWeb3Service(host, account, {
      XyStakingConsensus: {
        address: '0x567306106febB682f04BB97cb0e1a4902c60B096',
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
      const huh = await consensus.getRequestById(1)
      console.log("getRequestById", huh)
      await delay(100)

      // let huh2 = await consensus.getRequestById(2)
      // console.log("2nd time works?", huh2)
      // await delay(100);

      // let huh3 = await consensus.getRequestById(3)
      // console.log("how bout 3?", huh3)
      // await delay(100);

    })
    it('Should get all requests', async () => {

      const huh = await consensus.getAllRequests()
      console.log("getAllRequests", huh)
      await delay(100)
    })
    it('Should get last block hash', async () => {

      const huh = await consensus.getLatestBlockHash()
      console.log("getLatestBlockHash", huh)
      await delay(100)
    })
  })

})
