/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 7th March 2019 12:00:54 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-witness-validator.ts

 * @Last modified time: Tuesday, 12th March 2019 1:31:29 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { BN } from '@xyo-network/utils'
import { XyoBase } from '@xyo-network/base'
import { XyoError } from '@xyo-network/errors'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoBoundWitness, XyoBoundWitnessValidator } from '@xyo-network/bound-witness'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBridgeHashSet } from '@xyo-network/origin-chain'
import { IXyoHashProvider } from '@xyo-network/hashing'
import { IConsensusProvider } from '@xyo-network/consensus'
import { IXyoContentAddressableService } from '@xyo-network/content-addressable-service'
import { IXyoBlockTransfer } from './@types'

export class XyoBlockWitnessValidator extends XyoBase {

  constructor(
    private readonly contentService: IXyoContentAddressableService,
    private readonly serializer: IXyoSerializationService,
    private readonly hashProvider: IXyoHashProvider,
    private readonly boundWitnessValidator: XyoBoundWitnessValidator,
    private readonly consensusProvider: IConsensusProvider
  ) {
    super()
  }

  public async validate(
    blockHash: string,
    agreedStakeBlockHeight: BN,
    previousBlockHash: string,
    supportingDataHash: string,
    requests: string[],
    responses: Buffer
  ): Promise<boolean> {
    const validatesSupportingData = await this.validateSupportingData(
      supportingDataHash,
      requests,
      responses
    )

    if (!validatesSupportingData) return false

    const myEncodedBlock = await this.consensusProvider.encodeBlock(
      previousBlockHash,
      agreedStakeBlockHeight,
      requests,
      supportingDataHash,
      responses
    )

    return myEncodedBlock === blockHash
  }

  public async validateSupportingData(
    supportingDataHash: string,
    requests: string[],
    responses: Buffer
  ) {
    const supportingData = await this.tryResolveSupportingData(supportingDataHash)
    if (supportingData.length !== requests.length) throw new XyoError('Corrupt Data')
    const resolvedRequests = await Promise.all(requests.map((req) => {
      return this.contentService.get(req)
    }))

    const res = await Promise.all(resolvedRequests.map(async (req, index) => {
      if (!req) throw new XyoError('Could not resolve request')

      const json = JSON.parse(req.toString())
      if (json.type !== 'intersection') throw new XyoError('Only intersection requests are supported')
      const supportingDataItem = supportingData[index]
      if (!supportingDataItem.hash) throw new XyoError('No hash provided in proof')
      const resolvedIntersectionBytes = await this.contentService.get(supportingDataItem.hash)
      if (!resolvedIntersectionBytes) throw new XyoError(`Could not resolve hash ${supportingDataItem.hash}`)

      const boundWitness = this.serializer.deserialize(resolvedIntersectionBytes).hydrate<IXyoBoundWitness>()
      if (boundWitness.parties.length !== 2) throw new XyoError(`Could not validate hash ${supportingDataItem.hash}`)
      let partyOne = boundWitness.parties[0].keySet.keys[0].serializeHex()
      let partyTwo = boundWitness.parties[1].keySet.keys[0].serializeHex()

      if (partyOne !== json.data.partyOne[0]) { // swap
        const tmp = partyTwo
        partyTwo = partyOne
        partyOne = tmp
      }

      if (
        partyOne !== json.data.partyOne[0] ||
        partyTwo !== json.data.partyTwo[0]
      ) {
        throw new XyoError(`Could not validate hash ${supportingDataItem.hash}`)
      }

      // await this.boundWitnessValidator.validateBoundWitness(undefined, boundWitness)

      if (
        !supportingDataItem.transfers ||
        !Array.isArray(supportingDataItem.transfers) ||
        supportingDataItem.transfers.length === 0) {
        return Buffer.alloc(1, 1)
      }

      const hashToFind = await this.hashProvider.createHash(boundWitness.getSigningData())
      const { failed } = await (supportingDataItem.transfers as IXyoBlockTransfer[])
        .reduce(async (memo, transfer, reducerIndex) => {
          const m = await memo
          if (m.failed) return m

          try {
            const nextBwBuffer = await this.contentService.get(transfer.hash)
            if (!nextBwBuffer) {
              m.failed = true
              return m
            }

            const nextBw = this.serializer.deserialize(nextBwBuffer).hydrate<IXyoBoundWitness>()
            await this.boundWitnessValidator.validateBoundWitness(undefined, nextBw)
            const indexOfParty = nextBw.parties.findIndex((party) => {
              return party
                .keySet
                .keys
                  .filter(k => m.pks.find(otherPk => otherPk.isEqual(k)))
                  .length > 0
            })

            if (indexOfParty === -1) {
              m.failed = true
              return m
            }

            const otherPartyIndex = (indexOfParty + 1) % 2

            const bridgeHashSet = nextBw.parties[indexOfParty]
              .getHeuristic<XyoBridgeHashSet>(schema.bridgeHashSet.id)
            if (!bridgeHashSet) {
              m.failed = true
              return m
            }

            const indexOfHash = bridgeHashSet.hashSet.findIndex(h => hashToFind.isEqual(h))
            if (indexOfHash === -1) {
              m.failed = true
              return m
            }

            return {
              failed: false,
              pks: [
                nextBw.parties[otherPartyIndex].keySet.keys[0]
              ]
            }
          } catch (e) {
            this.logError(`Failed to validate on index ${reducerIndex}`, e)
            m.failed = true
            return m
          }
        },      Promise.resolve({
          failed: false,
          pks: [boundWitness.parties[0].keySet.keys[0], boundWitness.parties[1].keySet.keys[0]]
        })
      )

      if (failed) throw new XyoError('Could not validate transfers')

      return Buffer.alloc(1, 1)
    }))

    const myAnswer = Buffer.concat(res)
    if (!myAnswer.equals(responses)) throw new XyoError('Different answers')

    return true
  }

  private async tryResolveSupportingData(supportingDataHash: string): Promise<any[]> {
    try {
      const res = await this.contentService.get(supportingDataHash)
      if (!res) throw new XyoError('Could not resolve supporting data hash')
      return JSON.parse(res.toString()) as any[]
    } catch (e) {
      this.logError('Could not resolve supporting data hash', e)
      throw e
    }
  }
}
