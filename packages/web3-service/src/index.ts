/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st December 2018 12:55:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 9:30:10 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export {
  IConsensusContract,
  IContractData
} from './@types'

import Web3 from 'web3'
import { IContractData, ISignedTxParams } from './@types'
import { IXyoContentAddressableService } from '@xyo-network/content-addressable-service'
import { XyoBase } from '@xyo-network/base'
import { XyoError } from '@xyo-network/errors'
import { WebsocketProvider } from 'web3-providers'
import TX from 'ethereumjs-tx'

export class XyoWeb3Service extends XyoBase {
  private web3: Web3 | undefined
  constructor (
    private readonly web3ProviderArgs: any,
    private readonly contentService: IXyoContentAddressableService,
    private readonly existingContracts: {[contractName: string]: IContractData},
    public readonly accountAddress: string,
    public readonly accountPrivateKey?: string,
  ) {
    super()
  }

  public async signMessage(message: string): Promise<any> {
    const web3 = await this.getOrInitializeWeb3()
    return web3.eth.sign(message, this.accountAddress)
  }

  public async getContractByName(name: string): Promise<any> {
    const web3 = await this.getOrInitializeWeb3()
    const abi = await this.getABIOfContract(name)
    const address = await this.getAddressOfContract(name)

    try {
      const contract = new web3.eth.Contract(abi, address)
      return contract
    } catch (err) {
      this.logError(`There was an error retrieving contract with name ${name}`, err)
      throw err
    }
  }

  public async getABIOfContract(name: string): Promise<any> {
    const hash = this.existingContracts[name].ipfsHash
    const rawData = await this.contentService.get(hash)
    const ipfsData = JSON.parse(String(rawData))

    return ipfsData.abi
  }

  public padLeft(hexString: string, toLength: number): string {
    if (!hexString) {
      return "0x0000000000000000000000000000000000000000000000000000000000000000"
    }
    if (!this.web3) {
      const padded = hexString.startsWith('0x') ?
      hexString.slice(2, hexString.length).padStart(64, '0') :
      hexString.padStart(64, '0')
      return `0x${padded}`
    }
    const forceHex = this.web3.utils.stringToHex(hexString)
    return this.web3.utils.padLeft(forceHex, toLength)
  }

  public async getAddressOfContract(name: string): Promise<string> {
    const contract = this.existingContracts[name]
    if (!contract) {
      throw new XyoError(`Could not find contract with name ${name}`)
    }

    return contract.address
  }

  public async sendRawTx(params: ISignedTxParams): Promise<any> {
    const web3 = await this.getOrInitializeWeb3()
    const from = this.accountAddress
    const nonce = await web3.eth.getTransactionCount(from)
    const gas = web3.utils.toHex(3000000)
    const gasPrice = web3.utils.toHex(5 * 1e9) // 5 gwei
    const txParams = {
      from,
      nonce,
      gas,
      gasPrice,
      to: params.to,
      value: params.value || 0,
      data: params.data,
    }
    const tx = new TX(txParams)
    tx.sign(Buffer.from(this.accountPrivateKey!, 'hex'))
    const serializedTx = tx.serialize()
    console.log('serializedTx : ', serializedTx)
    return new Promise((resolve, reject) => {
      web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
        .on('receipt', (r: any) => {
          resolve(r)
        })
        // .on('confirmation', console.log)
        // .on('transactionHash', console.log)
        .on('error', reject)
    })
  }

  public async callRawTx(params: ISignedTxParams): Promise<any> {
    const web3 = await this.getOrInitializeWeb3()
    const from = this.accountAddress
    const nonce = await web3.eth.getTransactionCount(from)
    const gas = web3.utils.toHex(3000000)
    const gasPrice = web3.utils.toHex(5 * 1e9) // 5 gwei
    const txParams = {
      from,
      nonce,
      gas,
      gasPrice,
      to: params.to,
      value: params.value || 0,
      data: params.data.toString(),
    }
    const tx = new TX(txParams)
    tx.sign(Buffer.from(this.accountPrivateKey!, 'hex'))
    const serializedTx = tx.serialize()
    console.log('serializedTx : ', serializedTx)
    return web3.eth.call(txParams)
  }

  public async getOrInitializeWeb3(): Promise<Web3> {
    if (this.web3) {
      return this.web3
    }

    if (!this.web3ProviderArgs) {
      throw new XyoError('No web3 provider args provided')
    }

    if (typeof this.web3ProviderArgs !== 'string') { // Consider extending this
      throw new XyoError('Web3 initialization parameters need to be a string')
    }

    const httpProvider = new WebsocketProvider(this.web3ProviderArgs)
    this.web3 = new Web3(httpProvider)

    if (this.accountPrivateKey) {
      const account = this.web3.eth.accounts.privateKeyToAccount(`0x${this.accountPrivateKey}`)
      if (account.address.toLowerCase() !== this.accountAddress.toLowerCase()) {
        throw new XyoError(`Invalid Eth crypto key pair`)
      }

      this.web3.eth.accounts.wallet.add(account)
      this.web3.defaultAccount = account.address
    }

    return this.web3
  }

  public async getOrInitializeSC(name: string): Promise<any> {
    if (this.existingContracts[name].contract) {
      return this.existingContracts[name].contract
    }
    this.existingContracts[name].contract = await this.getContractByName(name)
    return this.existingContracts[name].contract
  }

}
