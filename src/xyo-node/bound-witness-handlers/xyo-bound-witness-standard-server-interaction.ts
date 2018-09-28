/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 28th September 2018 9:46:58 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-standard-server-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 28th September 2018 9:55:56 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessServerInteraction } from "../xyo-bound-witness-server-interaction";
import { CatalogueItem } from "../../network/xyo-catalogue-item";

export class XyoBoundWitnessStandardServerInteraction extends XyoBoundWitnessServerInteraction {
  get catalogueItem(): CatalogueItem  {
    return CatalogueItem.BOUND_WITNESS;
  }
}
