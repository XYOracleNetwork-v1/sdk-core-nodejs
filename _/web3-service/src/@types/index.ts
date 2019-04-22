/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 21st December 2018 1:02:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts

 * @Last modified time: Tuesday, 5th March 2019 2:19:48 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { Contract } from 'web3-eth-contract'

export interface IContractData {
  address: string
  ipfsHash: string
  name?: string
  contract?: Contract
}

export interface IContractAbi {
  methods: any
}

export interface IConsensusContract {
  methods: any
}

export interface IStakableTokenContract {
  methods: any
}

export interface ISignedTxParams {
  to: string,
  value?: string,
  data: Buffer
}
