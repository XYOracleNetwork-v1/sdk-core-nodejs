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

describe('Consensus', () => {
  it('Should do something', async () => {
    const host =  'http://127.0.0.1:8545'
    const account = '0x123'
    const web3Service = new XyoWeb3Service(host, account, {
      PayOnDelivery:  {
        address: '0x123',
      }
    })

    new XyoScscConsensusProvider(web3Service).printSomething()
  })
})
