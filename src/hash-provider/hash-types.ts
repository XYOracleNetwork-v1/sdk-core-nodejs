/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 3rd October 2018 4:56:00 pm
 * @Email:  developer@xyfindables.com
 * @Filename: hash-types.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 3rd October 2018 4:58:04 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoHash } from "../components/hashing/xyo-hash";
import { XyoHashProvider } from "./xyo-hash-provider";

export interface XyoHashFactory {
  newInstance(hashProvider: XyoHashProvider | undefined, hash: Buffer): XyoHash;
}
