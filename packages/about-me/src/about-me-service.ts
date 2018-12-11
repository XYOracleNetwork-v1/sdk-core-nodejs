/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 11:21:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: about-me-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 11th December 2018 10:27:24 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { XyoIpService } from '@xyo-network/ip-service'
import { IXyoPublicKey } from '@xyo-network/signing'
import {
  XyoPeerDiscoveryService,
  IXyoPeerDescriptionWithPeers,
  IXyoPeerDescription
} from '@xyo-network/peer-discovery'

import uuid from 'uuid'

/**
 * A service for declaring public information about a node such
 * that it can be used to socialize with other nodes in the p2p
 * network
 *
 * @export
 * @class XyoAboutMeService
 * @extends {XyoBase}
 */
export class XyoAboutMeService extends XyoBase {

  // The name of the of node
  private readonly name: string

  // The ip address override
  private readonly ipOverride?: string

  // A data-structure for keeping track of nodes with a variety of indexes for fast lookup
  private peers: IPeerOrganizer = {
    collection: [],
    byName: {},
    byNetworkId: {},
    byAddress: {}
  }

  // An optional peer-description, its optional because a node doesn't necessarily have to share their info
  // when interrogating other nodes
  private peerDescription?: IXyoPeerDescriptionWithPeers

  /**
   * Creates an instance of XyoAboutMeService.
   *
   * @param {XyoIpService} ipService Used to find out information about its own ip address
   * @param {string} version The current xyo version this node is using
   * @param {boolean} isPubliclyAddressable True, if the ip address this node is using is known to publicly-accessible
   * @param {IXyoPublicKey} genesisPublicKey The genesis key that belongs to the node's origin chain
   * @param {XyoPeerDiscoveryService} peerDiscoverService The service used to find peers in the p2p network
   * @param {IAboutMeCtorOptions} [options] Optional Name and explicit ip override.
   * @memberof XyoAboutMeService
   */

  constructor (
    private readonly ipService: XyoIpService,
    private readonly version: string,
    private readonly isPubliclyAddressable: boolean,
    private readonly genesisPublicKey: IXyoPublicKey,
    private readonly peerDiscoverService: XyoPeerDiscoveryService,
    options?: IAboutMeCtorOptions
  ) {
    super()

    // If a `name` is provided use that, otherwise assign one based off a random uuid
    this.name = (options && options.name) || uuid()

    // If an `ipOverride` is provided used that, otherwise default to undefined
    this.ipOverride = (options && options.publicIpOverride) || undefined
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

  public async getAboutMe(aboutYou?: IXyoPeerDescriptionWithPeers): Promise<IXyoPeerDescriptionWithPeers> {
    // If the peer asking has provided info about themselves, then add them to the queue
    // of nodes to interrogate
    if (aboutYou && aboutYou.ip && aboutYou.graphqlPort) {
      this.peerDiscoverService.addPeerCandidate({
        ip: aboutYou.ip,
        port: aboutYou.graphqlPort
      })

      // Vet peers of peers
      if (
        aboutYou.peers &&
        aboutYou.peers &&
        aboutYou.peers instanceof Array &&
        aboutYou.peers.length > 0
      ) {
        aboutYou.peers.forEach((p) => {
          if (p.ip && p.graphqlPort) {
            this.peerDiscoverService.addPeerCandidate({
              ip: p.ip,
              port: p.graphqlPort
            })
          }
        })
      }
    }

    // Try to get the ip of this node
    const ip = await this.ipService.getMyIp()

    const me = {
      name: this.name,
      version: this.version,
      ip: this.ipOverride || (this.isPubliclyAddressable ? ip.public : ip.external),
      graphqlPort: ip.graphqlPort,
      nodePort: ip.nodePort,
      address:  (this.genesisPublicKey.serialize() as Buffer).toString('hex'),
      peers: this.peers.collection
    }

    // Coerce `me` data into a peer-description
    this.peerDescription = {
      name: me.name,
      version: this.version,
      ip: (this.ipOverride || (this.isPubliclyAddressable ? ip.public! : ip.external!)) || 'N/A',
      graphqlPort: me.graphqlPort || -1,
      nodePort: me.nodePort || -1,
      address: me.address,
      peers: this.peers.collection
    }

    // Let the peer description service know you've been updated
    this.peerDiscoverService.updatePeerDescription(this.peerDescription)

    return me as IXyoPeerDescriptionWithPeers
  }

  /**
   * Starts to discover peers using the delegated `peerDiscoveryService`.
   * When a new peer is discovered it alerts the peerDiscoveryService` that
   * their known nodes have been updated.
   *
   * Additionally, this function returns a `stop` function that can be called
   * **ONCE** to stop the peer-discovery process
   *
   * @returns
   * @memberof XyoAboutMeService
   */
  public startDiscoveringPeers() {
    // Delegate finding to the peerDiscoverService
    const stop = this.peerDiscoverService.findPeers((peer) => {

      // put together a canonical id from the network ip and graphql port
      const networkId = `${peer.ip}:${peer.graphqlPort}`

      // Its practically impossible to really KNOW if you know about the existence of another
      // node based simply off its networkId since there can be an infinite amount
      // of proxies, though assuming the node isn't changing their ip we can check
      // here if they are already a peer. If they are not a peer already add them
      // to the list of known nodes and update indexes and subsequently alert the
      // `peerDiscoverService` that you've been updated

      if (
        !this.peers.byAddress[peer.address] &&
        !this.peers.byNetworkId[networkId] &&
        !this.peers.byName[peer.name]
      ) {
        const index = this.peers.collection.length
        this.peers.collection.push(peer)
        this.peers.byAddress[peer.address] = index
        this.peers.byNetworkId[networkId] = index
        this.peers.byName[peer.name] = index

        if (this.peerDescription) {
          this.peerDiscoverService.updatePeerDescription(this.peerDescription)
        }
        return true
      }

      return false
    })

    return () => {
      stop()
    }
  }
}

// A data-structure for collection peer descriptions and keeping some indexes against them
interface IPeerOrganizer {
  collection: IXyoPeerDescription[],
  byName: {
    [s: string]: number
  },
  byNetworkId: {
    [s: string]: number
  },
  byAddress: {
    [s: string]: number
  }
}

// Explicit override options for the constructor
interface IAboutMeCtorOptions {
  name?: string,
  publicIpOverride?: string
}
