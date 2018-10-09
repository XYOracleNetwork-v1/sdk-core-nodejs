/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 8th October 2018 5:45:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-public-key.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 8th October 2018 6:00:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoObject } from "../components/xyo-object";

export interface XyoPublicKey extends XyoObject {
  getRawPublicKey(): Buffer;
}
