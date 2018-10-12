/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 6th September 2018 2:01:54 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-catalogue-item.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 11th October 2018 1:49:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * The catalogue items this node knows about
 */
export enum CatalogueItem  {
  BOUND_WITNESS = Math.pow(2, 0),
  TAKE_ORIGIN_CHAIN = Math.pow(2, 1),
  GIVE_ORIGIN_CHAIN = Math.pow(2, 2)
}

/**
 * A utility function for translating a buffer to a list of catalogues items
 * that another node is willing to do.
 *
 * @param buffer The data buffer to read and translate
 */

export function bufferToCatalogueItems(buffer: Buffer): CatalogueItem[] {
  if (buffer.length < 4) {
    return [];
  }

  const values = buffer.readUInt32BE(0);

  return [
    (CatalogueItem.BOUND_WITNESS & values) > 0 ? CatalogueItem.BOUND_WITNESS : null,
    (CatalogueItem.TAKE_ORIGIN_CHAIN & values) > 0 ? CatalogueItem.TAKE_ORIGIN_CHAIN : null,
    (CatalogueItem.GIVE_ORIGIN_CHAIN & values) > 0 ? CatalogueItem.GIVE_ORIGIN_CHAIN : null
  ]
  .filter(catalogueItem => catalogueItem !== null) as CatalogueItem[];
}

/** Returns a number, which is feature-mask representing CatalogueItems */
export function catalogueItemsToMask(catalogueItems: CatalogueItem[]) {
  return catalogueItems.reduce((sum, item) => sum + item, 0);
}
