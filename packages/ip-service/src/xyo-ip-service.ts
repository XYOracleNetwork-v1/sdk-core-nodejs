/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 11:42:38 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ip-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 5th December 2018 2:44:27 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { v4 as publicIpV4 } from 'public-ip'
import externalIp from 'external-ip'
import { promisify } from 'util'
import { get_active_interface, IActiveNetwork } from 'network'

// Promisify the native callback APIs
const getIp =  promisify(externalIp()) as () => Promise<string | undefined>
const getActiveInterface = promisify(get_active_interface) as () => Promise<IActiveNetwork | undefined>

export class XyoIpService {

  constructor(private readonly graphqlPort?: number, private readonly nodePort?: number) {}

  /**
   * Get the ip information for this network device
   *
   * @returns {Promise<IXyoIp>}
   * @memberof XyoIpService
   */

  public async getMyIp(): Promise<IXyoIp> {
    const result: IXyoIp = {
      graphqlPort: this.graphqlPort,
      nodePort: this.nodePort
    }

    /** We use two external ip services for public for parity as well as removing single source of failure */
    const [
      publicIpSource1,
      publicIpSource2,
      activeInterface
    ] = await Promise.all([
      getIp(),
      publicIpV4(),
      getActiveInterface()
    ])

    if (publicIpSource1 && publicIpSource2 && publicIpSource1 === publicIpSource2) {
      result.public = publicIpSource1
    }

    if (activeInterface) {
      result.external = activeInterface.ip_address
      result.macAddress = activeInterface.mac_address
    }

    return result
  }
}

export interface IXyoIp {
  /** The public facing ip-address of this node */
  public?: string

  /** The external-network ip-address of this node */
  external?: string

  macAddress?: string

  /** If a node is listening on a particular graphql port, this will be set */
  graphqlPort?: number

  /** Communication with other nodes via TCP will take place on this port */
  nodePort?: number
}
