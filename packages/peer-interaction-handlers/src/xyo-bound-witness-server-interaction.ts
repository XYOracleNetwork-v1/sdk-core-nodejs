/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 9:50:32 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-server-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 4:52:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  CatalogueItem,
  IXyoNetworkPipe,
  CATALOGUE_LENGTH_IN_BYTES,
  CATALOGUE_SIZE_OF_SIZE_BYTES
} from '@xyo-network/network'

import { IXyoBoundWitness, IXyoPayload, XyoBoundWitness, FetterOrWitness, XyoKeySet, XyoFetter, XyoFetterSet, XyoSignatureSet, XyoWitness, XyoWitnessSet } from '@xyo-network/bound-witness'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { IXyoNodeInteraction } from '@xyo-network/peer-interaction'
import { XyoBase } from '@xyo-network/base'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoSerializationService, ParseQuery } from '@xyo-network/serialization'

/**
 * An `XyoBoundWitnessInteraction` manages a "session"
 * between two networked nodes.
 */

// tslint:disable-next-line:max-line-length
export abstract class XyoBoundWitnessServerInteraction extends XyoBase implements IXyoNodeInteraction<IXyoBoundWitness> {

  public abstract catalogueItem: CatalogueItem

  constructor(
    private readonly signers: IXyoSigner[],
    private readonly payload: IXyoPayload,
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
  }

  /**
   * Does a bound witness with another node
   */

  public async run(networkPipe: IXyoNetworkPipe): Promise<IXyoBoundWitness> {
    let disconnected = false

    return new Promise(async (resolve, reject) => {
      /**
       * Listener for if and when the peer disconnects
       */
      const unregister = networkPipe.onPeerDisconnect(() => {
        disconnected = true
        this.logInfo(`Peer disconnected in xyo-bound-witness-interaction`)
      })

      this.logInfo(`Starting bound witness`)

      if (!disconnected) {
        if (!disconnected) {
          const keySet = new XyoKeySet(this.signers.map(s => s.publicKey))
          const fetter = new XyoFetter(keySet, this.payload.heuristics)
          const fetterSet = new XyoFetterSet([fetter])

          /** Tell the other node this is the catalogue item you chose */
          const catalogueBuffer = Buffer.alloc(CATALOGUE_LENGTH_IN_BYTES)
          catalogueBuffer.writeUInt32BE(this.catalogueItem, 0)
          const sizeOfCatalogueInBytesBuffers = Buffer.alloc(CATALOGUE_SIZE_OF_SIZE_BYTES)
          sizeOfCatalogueInBytesBuffers.writeUInt8(CATALOGUE_LENGTH_IN_BYTES, 0)

          /** Build the final message */
          const bytesToSend = Buffer.concat([
            sizeOfCatalogueInBytesBuffers,
            catalogueBuffer,
            fetterSet.serialize()
          ])

          if (!disconnected) {
            let response: Buffer | undefined

            try {
              response = await networkPipe.send(bytesToSend)
              if (!response) {
                throw new XyoError(`Unexpected undefined response in bound witness interaction`, XyoErrors.CRITICAL)
              }
            } catch (err) {
              this.logError(`Failed BoundWitnessTransfer on step 1`, err)
              return reject(err)
            }

            const transferObject = this.serializationService.deserialize(response)
            this.logInfo('Transfer Object', transferObject.serializeHex())

            const transferQuery = this.serializationService.deserialize(response).query()

            const numberOfItemsInTransfer = transferQuery.getChildrenCount()
            if (numberOfItemsInTransfer < 2 || numberOfItemsInTransfer % 2 !== 0) {
              this.logError(`Invalid Bound Witness Fragments`)
              return reject()
            }

            const aggregator: Buffer[] = [fetter.serialize()]
            aggregator.push(transferQuery.query([0]).readData(true))
            const signingData = Buffer.concat(aggregator)
            this.logInfo(`Signing Data`, signingData.toString('hex'))
            const signatures = await Promise.all(this.signers.map(async (signer) => {
              const sig = await signer.signData(signingData)

              this.logInfo(`signer public key`, signer.publicKey.serializeHex())
              this.logInfo(`signer sig`, sig.serializeHex())
              return sig
            }))

            if (!disconnected) {
              const signatureSet = new XyoSignatureSet(signatures)
              const witness = new XyoWitness(signatureSet, this.payload.metadata)
              const witnessSet = new XyoWitnessSet([witness])

              try {
                await networkPipe.send(witnessSet.serialize(), false)
              } catch (err) {
                this.logError(`Failed BoundWitnessTransfer on step 3`, err)
                return reject(err)
              }

              /** Stop listening for disconnect events */
              unregister()

              /** Close the connection */
              await networkPipe.close()

              const fragmentParts = transferQuery
                .reduceChildren((memo, parseResult, index) => {
                  memo.push(
                    this.serializationService
                      .deserialize(new ParseQuery(parseResult).readData(true))
                      .hydrate<FetterOrWitness>()
                  )
                  return memo
                }, [fetter] as FetterOrWitness[])
              fragmentParts.push(witness)
              return resolve(new XyoBoundWitness(fragmentParts))
            }
          }
        }
      }

      return reject(new XyoError(`Peer disconnected in xyo-bound-witness-interaction`, XyoErrors.CRITICAL))
    }) as Promise<IXyoBoundWitness>
  }
}
