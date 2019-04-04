/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 11:29:03 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-simple-peer-connection-delegate.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:44:25 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoNetworkProvider, IXyoNetworkProcedureCatalogue, IXyoNetworkPeer, IXyoNetworkPipe, CATALOGUE_LENGTH_IN_BYTES, CATALOGUE_SIZE_OF_SIZE_BYTES, CatalogueItem, bufferToCatalogueItems } from '@xyo-network/network'
import { IXyoPeerConnectionDelegate, IXyoPeerConnectionHandler } from './@types'
import { XyoBase } from '@xyo-network/base'

export class XyoSimplePeerConnectionDelegate extends XyoBase implements IXyoPeerConnectionDelegate {

  constructor (
    private readonly network: IXyoNetworkProvider,
    private readonly catalogue: IXyoNetworkProcedureCatalogue,
    private readonly peerConnectionHandler: IXyoPeerConnectionHandler
  ) {
    super()
  }

  public async provideConnection() {
    return this.network.find(this.catalogue)
  }

  public stopProvidingConnections() {
    return this.network.stopServer()
  }

  public async doClientNegotiation (networkPipe: IXyoNetworkPipe) {
    const pipe = networkPipe
    const firstMessage = this.getFirstMessage(this.combineCatalogueItems(this.catalogue.getCurrentCatalogue()))
    const encodedResponse = await pipe.send(firstMessage.bytesToSend, true)

    if (encodedResponse) {
      const { serversChoices, response } = this.getChoiceAndResponse(encodedResponse)

      if (serversChoices.length !== 1) {
        // this is thrown when the server chooses more than one item
        throw Error("Invalid choice!")
      }

      pipe.initiationData = response

      const serversChoice = serversChoices[0]
      return { pipe, serversChoice }
    }

    throw Error("No response!")
  }

  public async handlePeerConnection(networkPipe: IXyoNetworkPipe) {
    const initiationData = networkPipe.initiationData

    if (initiationData) {
      // is a server, networkPipe.initiationData is the clients catalogue
      const clientCatalogueItems = this.getClientCatalogue(initiationData)
      return this.peerConnectionHandler.handlePeerConnection(
        networkPipe,
        undefined,
        clientCatalogueItems,
        initiationData === undefined
      )
    }
    // is a client, networkPipe.initiationData is null, so we must send them our catalogue
    // the pipe here is the new pipe with contained data (the servers response)
    const { pipe, serversChoice } = await this.doClientNegotiation(networkPipe)
    return this.peerConnectionHandler.handlePeerConnection(
      pipe,
      serversChoice,
      undefined,
      initiationData === undefined
      )
  }

  private getFirstMessage(catalogue: CatalogueItem) {

    // Tell the other node this is the catalogue item you chose
    const catalogueBuffer = Buffer.alloc(CATALOGUE_LENGTH_IN_BYTES)
    const sizeOfCatalogueInBytesBuffers = Buffer.alloc(CATALOGUE_SIZE_OF_SIZE_BYTES)

    catalogueBuffer.writeUInt32BE(catalogue, 0)
    sizeOfCatalogueInBytesBuffers.writeUInt8(CATALOGUE_LENGTH_IN_BYTES, 0)

    // Build the final message
    const bytesToSend = Buffer.concat([
      sizeOfCatalogueInBytesBuffers,
      catalogueBuffer,
    ])

    return { bytesToSend }
  }

  private getClientCatalogue (bytes: Buffer): CatalogueItem[] {
    if (bytes.length < 2) {
      return []
    }

    const encodedCatalogue = bytes.slice(1)

    return bufferToCatalogueItems(encodedCatalogue)
  }

  private combineCatalogueItems(items: CatalogueItem[]): number {
    let int = 0

    items.forEach((item) => {
      int = int | item
    })

    return int
  }

  private getChoiceAndResponse(message: Buffer) {
    const sizeOfCat = message.readUInt8(0)
    const response = message.slice(1 + sizeOfCat, message.length)
    const cat = message.slice(1, sizeOfCat + 1)
    const serversChoices = bufferToCatalogueItems(cat)

    return { serversChoices, response }
  }

  // // todo find a better way of getting the enum from a number
  // private getEnumFromValue (value: number): CatalogueItem {
  //   console.log(value)
  //   const allEnums = [
  //     CatalogueItem.BOUND_WITNESS,
  //     CatalogueItem.TAKE_ORIGIN_CHAIN,
  //     CatalogueItem.GIVE_ORIGIN_CHAIN,
  //     CatalogueItem.TAKE_REQUESTED_BLOCKS,
  //     CatalogueItem.GIVE_REQUESTED_BLOCKS]

  //   let i = 0
  //   for (const index of allEnums) {
  //     if (index === value) {
  //       return allEnums[i]
  //     }
  //     i++
  //   }

  //   throw Error(`Invalid Catalogue Item: ${value}`)
  // }
}
