/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 21st November 2018 10:32:58 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-standard-server-interaction.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 21st November 2018 10:33:21 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBoundWitnessServerInteraction } from "./xyo-bound-witness-server-interaction"
import { CatalogueItem } from "@xyo-network/network"

export class XyoBoundWitnessStandardServerInteraction extends XyoBoundWitnessServerInteraction {

  get catalogueItem(): CatalogueItem  {
    return CatalogueItem.BOUND_WITNESS
  }
}
