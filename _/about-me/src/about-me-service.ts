/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Monday, 3rd December 2018 11:21:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: about-me-service.ts

 * @Last modified time: Thursday, 14th February 2019 12:09:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { IXyoPublicKey } from '@xyo-network/signing'
import { IXyoPeerDescriptionWithPeers } from '@xyo-network/peer-discovery'

import { IProvider } from '@xyo-network/utils'

export class XyoAboutMeService extends XyoBase {

  constructor (
    private readonly ip: string,
    private readonly boundWitnessServerPort: number | undefined,
    private readonly graphqlPort: number | undefined,
    private readonly version: string,
    private readonly genesisPublicKey: IXyoPublicKey,
    private readonly peersProvider: IProvider<string[]>,
    private readonly name: string
  ) {
    super()
  }

  /**
   * Provides `AboutMe` information for a particular node. If the consumer
   * of this function (another node) provides their `AboutMe` information
   * then that information will be added to queue for interrogation before
   * adding them to a peer in the Xyo network
   *
   * @param {IXyoPeerDescriptionWithPeers} [aboutYou] An optional `AboutMe` description from another node
   * @returns {Promise<IXyoPeerDescriptionWithPeers>} Asynchronously returns the `AboutMe` description for this node
   * @memberof XyoAboutMeService
   */

  public async getAboutMe(): Promise<IXyoPeerDescriptionWithPeers> {
    const peers = await this.peersProvider.get()
    const me: IXyoPeerDescriptionWithPeers = {
      peers,
      name: this.name,
      version: this.version,
      ip: this.ip,
      graphqlPort: this.graphqlPort,
      boundWitnessServerPort: this.boundWitnessServerPort,
      address:  this.genesisPublicKey.serializeHex(),
    }

    return me
  }
}
