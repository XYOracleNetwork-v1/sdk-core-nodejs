/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 28th February 2019 11:14:20 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-witness-requester-handler.ts
 
 * @Last modified time: Monday, 11th March 2019 12:37:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBaseHandler } from "./xyo-base-handler"
import { IXyoP2PService } from "@xyo-network/p2p"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { IConsensusProvider } from "@xyo-network/consensus"
import { IBlockWitnessRequest } from "../@types"
import { BN } from "@xyo-network/utils"

export class XyoWitnessRequestHandler extends XyoBaseHandler {

  constructor(
    protected readonly serializationService: IXyoSerializationService,
    private readonly p2pService: IXyoP2PService,
    private readonly consensusProvider: IConsensusProvider,
    private readonly blockWitnessValidator: {
      validate(
        blockHash: string,
        agreedStakeBlockHeight: BN,
        previousBlockHash: string,
        supportingDataHash: string,
        requests: string[],
        responses: Buffer
      ): Promise<boolean>
    }
  ) {
    super(serializationService)
  }

  public initialize(): void {
    this.addUnsubscribe(
      'block-witness:request',
      this.p2pService.subscribe('block-witness:request', (publicKey, msg) => {
        this.onBlockWitnessRequest(publicKey, msg)
      })
    )
  }

  private async onBlockWitnessRequest(publicKey: string, msg: Buffer) {
    const json = this.messageParser.tryParseBlockWitnessRequest(msg, { publicKey })
    if (!json) return
    const block: IBlockWitnessRequest = {
      blockHash: `0x${json.blockHash}`,
      agreedStakeBlockHeight: new BN(`0x${json.agreedStakeBlockHeight}`),
      previousBlockHash: `0x${json.previousBlockHash}`,
      supportingDataHash: json.supportingDataHash,
      requests: json.requests.map(r => `0x${r}`),
      responses: Buffer.from(json.responses, 'hex')
    }

    try {
      await this.blockWitnessValidator.validate(
        block.blockHash,
        block.agreedStakeBlockHeight,
        block.previousBlockHash,
        block.supportingDataHash,
        block.requests,
        block.responses
      )
      const encodedBlock = await this.consensusProvider.encodeBlock(
        block.previousBlockHash,
        block.agreedStakeBlockHeight,
        block.requests,
        block.supportingDataHash,
        block.responses
      )

      const sigComponents = await this.consensusProvider.signBlock(encodedBlock)
      const res = {
        publicKey: sigComponents.publicKey,
        r: sigComponents.sigR,
        s: sigComponents.sigS,
        v: sigComponents.sigV,
      }
      const bufferResponse = Buffer.from(JSON.stringify(res))
      this.p2pService.publish(`block-witness:request:${json.blockHash}`, bufferResponse)
    } catch (e) {
      this.logError(`Could not validate block candidate with hash ${block.blockHash}`, e)
      return undefined
    }
  }
}
