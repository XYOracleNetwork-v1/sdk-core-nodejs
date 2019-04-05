/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 10:18:42 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th February 2019 1:28:15 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { CatalogueItem } from './catalogue-item'
import { IXyoNetworkProcedureCatalogue } from './@types'
import { number } from 'joi'

export { CatalogueItem } from './catalogue-item'
export { XyoMockNetworkPipe } from './xyo-mock-network-pipe'
export { IXyoNetworkPeer, IXyoNetworkPipe, IXyoNetworkProcedureCatalogue, IXyoNetworkProvider } from './@types'

/**
 * Some very important numbers that factor into the catalogue negotiation protocol
 */

/** The current number of bytes that encode the length if the catalogue */
export const CATALOGUE_LENGTH_IN_BYTES = 4

/** This number of bytes allowed to encode how big the catalogue can be */
export const CATALOGUE_SIZE_OF_SIZE_BYTES = 1

/**
 * When a payload is passed it is padded with the length of bytes of the payload.
 * It gets 4 bytes to do so
 */
export const CATALOGUE_SIZE_OF_PAYLOAD_BYTES = 4

/**
 * A utility function for translating a buffer to a list of catalogues items
 * that another node is willing to do.
 *
 * @param buffer The data buffer to read and translate
 */

export function bufferToCatalogueItems(buffer: Buffer): CatalogueItem[] {
  const values = readNumberFromBufferCatalogue(buffer)

  return [
    (CatalogueItem.BOUND_WITNESS & values) > 0 ? CatalogueItem.BOUND_WITNESS : null,
    (CatalogueItem.TAKE_ORIGIN_CHAIN & values) > 0 ? CatalogueItem.TAKE_ORIGIN_CHAIN : null,
    (CatalogueItem.GIVE_ORIGIN_CHAIN & values) > 0 ? CatalogueItem.GIVE_ORIGIN_CHAIN : null
  ]
  .filter(catalogueItem => catalogueItem !== null) as CatalogueItem[]
}

const readNumberFromBufferCatalogue = (buffer: Buffer): number => {
  if (buffer.length === 4) {
    return buffer.readUInt32BE(0)
  }

  if (buffer.length === 2) {
    return buffer.readUInt16BE(0)
  }

  if (buffer.length === 1) {
    return buffer.readUInt8(0)
  }

  return 0
}

/** Returns a number, which is feature-mask representing CatalogueItems */
export function catalogueItemsToMask(catalogueItems: CatalogueItem[]) {
  return catalogueItems.reduce((sum, item) => sum + item, 0)
}

export class XyoNetworkProcedureCatalogue implements IXyoNetworkProcedureCatalogue {

  private catalogue: CatalogueItem[] = []

  public canDo(catalogueItem: CatalogueItem): boolean {
    return this.catalogue.indexOf(catalogueItem) > -1
  }

  public getCurrentCatalogue(): CatalogueItem[] {
    return this.catalogue
  }

  public setCatalogue(catalogue: CatalogueItem[]) {
    this.catalogue = catalogue
  }

}
