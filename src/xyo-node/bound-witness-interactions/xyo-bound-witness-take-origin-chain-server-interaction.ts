/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 28th September 2018 9:46:58 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-standard-server-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:11:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessServerInteraction } from "./xyo-bound-witness-server-interaction";
import { CatalogueItem } from "../../xyo-network/xyo-catalogue-item";

export class XyoBoundWitnessTakeOriginChainServerInteraction extends XyoBoundWitnessServerInteraction {
  get catalogueItem(): CatalogueItem  {
    return CatalogueItem.TAKE_ORIGIN_CHAIN;
  }
}
