/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 5th February 2019 11:56:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-block-permission-request-resolver.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th February 2019 3:17:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/** Tries to resolve permission for a block by requesting it from the node-network */

import { IBlockPermissionRequestResolver, IRequestPermissionForBlockResult } from '@xyo-network/attribution-request'
import { IXyoHash } from '@xyo-network/hashing'
import { IXyoNodeNetwork } from '@xyo-network/node-network'
import { XyoBase } from '@xyo-network/base'
import { IXyoSigner } from '@xyo-network/signing'
import { IXyoPayload } from '@xyo-network/bound-witness'

export class XyoBlockPermissionRequestResolver extends XyoBase implements IBlockPermissionRequestResolver {

  constructor (private readonly nodeNetwork: IXyoNodeNetwork) {
    super()
  }

  public async requestPermissionForBlock(
    hash: IXyoHash,
    signers: IXyoSigner[],
    payload: IXyoPayload,
    timeout: number
  ): Promise<IRequestPermissionForBlockResult | undefined> {
    let resolved = false
    return new Promise((resolve, reject) => {
      const unsubscribeFn = this.nodeNetwork.requestPermissionForBlock(hash, signers, payload, (pk, permission) => {
        if (resolved) {
          return
        }

        resolved = true
        resolve(permission)
        unsubscribeFn()
      })

      setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve(undefined)
          unsubscribeFn()
        }
      }, timeout)
    }) as Promise<IRequestPermissionForBlockResult | undefined>
  }
}
