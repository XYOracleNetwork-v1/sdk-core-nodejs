/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 5th February 2019 11:56:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-permission-request-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th February 2019 12:08:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/** Tries to resolve permission for a block by requesting it from the node-network */

import { IBlockPermissionRequestResolver, IRequestPermissionForBlockResult } from '@xyo-network/attribution-request'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoNodeNetwork } from '@xyo-network/node-network'
import { XyoBase } from '@xyo-network/base'

export class XyoBlockPermissionRequestResolver extends XyoBase implements IBlockPermissionRequestResolver {

  constructor (private readonly nodeNetwork: IXyoNodeNetwork) {
    super()
  }

  public requestPermissionForBlock(hash: IXyoHash): Promise<IRequestPermissionForBlockResult | undefined> {
    throw new Error("Method not implemented.")
  }
}
