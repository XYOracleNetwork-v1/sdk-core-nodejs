/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 11th December 2018 9:33:01 am
 * @Email:  developer@xyfindables.com
 * @Filename: catalogue-item.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 9:33:26 am
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
