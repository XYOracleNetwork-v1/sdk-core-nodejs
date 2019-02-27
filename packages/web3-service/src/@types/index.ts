/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st December 2018 1:02:03 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st December 2018 2:29:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
// import { BigNumber } from 'bignumber.js'
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
