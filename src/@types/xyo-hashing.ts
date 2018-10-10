import { XyoHash } from "../xyo-hashing/xyo-hash";

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 9th October 2018 11:21:33 am
 * @Email:  developer@xyfindables.com
 * @Filename: hashing.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:12:22 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoHashFactory {
  newInstance(hashProvider: IXyoHashProvider | undefined, hash: Buffer): XyoHash;
}

/**
 * The interface for hashing providers in the system
 */

export interface IXyoHashProvider {
  createHash(data: Buffer): Promise<XyoHash>;
  verifyHash(data: Buffer, hash: Buffer): Promise<boolean>;
}
