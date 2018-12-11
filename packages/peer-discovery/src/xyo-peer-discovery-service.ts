/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 11:52:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-peer-discovery-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 7th December 2018 11:51:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import dns from 'dns'

import http from 'http'
import { XyoError, XyoErrors } from "@xyo-network/errors"
import { IXyoPeerCandidate, IXyoPeerDescriptionWithPeers, IXyoPeerDescription } from "./@types"

export class XyoPeerDiscoveryService extends XyoBase {

  private me?: IXyoPeerDescriptionWithPeers

  private readonly queue: IXyoPeerCandidate[] = []
  private readonly queueKeys: {[s: string]: boolean} = {}
  private readonly vettedPeers: {
    names: {[s: string]: boolean },
    networks: {
      [s: string]: boolean
    },
    addresses: {
      [s: string]: boolean;
    }
  } = {
    names: {},
    networks: {},
    addresses: {}
  }

  private blackList: {
    names: {[s: string]: boolean },
    networks: {
      [s: string]: boolean
    },
    addresses: {
      [s: string]: boolean;
    }
  } = {
    names: {},
    networks: {},
    addresses: {}
  }

  private readonly MIN_QUEUE_WAIT = 100
  private readonly MAX_QUEUE_WAIT = 30000

  private onPeerFound: ((peers: IXyoPeerDescription) => boolean) | undefined

  private processState: 'not-processing' | 'processing' | 'should-stop-processing' = 'not-processing'
  private queueProcessTimeout: NodeJS.Timeout | undefined

  constructor(
    private readonly peerCandidates: IXyoPeerCandidate[],
    private readonly dnsLookup: string | undefined,
    private readonly defaultPort: number
  ) {
    super()
    this.peerCandidates.forEach(candidate => this.addPeerCandidate(candidate))
  }

  public addPeerCandidate(candidate: IXyoPeerCandidate) {
    return this.addCandidateToQueue(candidate.ip, candidate.port)
  }

  public updatePeerDescription(peerDescription?: IXyoPeerDescriptionWithPeers) {
    this.me = peerDescription

    if (this.me) {
      this.addToExcludedPeers({
        name: this.me.name,
        network: {
          ip: this.me.ip,
          port: this.me.graphqlPort
        },
        address: this.me.address
      })
    }
  }

  public addToExcludedPeers(options: {
    name?: string,
    network?: {
      ip: string,
      port: number
    },
    address?: string
  }) {
    if (options.name) {
      this.blackList.names[options.name] = true
    }

    if (options.network) {
      const uniqueId = `${options.network.ip}:${options.network.port}`
      this.blackList.networks[uniqueId] = true
    }

    if (options.address) {
      this.blackList.addresses[options.address] = true
    }
  }

  /**
   * Starts finding peers. Returns a `stop` function which can be call to stop
   * searching.
   *
   * @param onPeerFound A callback that is called each time a new peer is discovered
   */

  public findPeers(onPeerFound: (peers: IXyoPeerDescription) => boolean): () => void {
    if (this.processState !== 'not-processing') {
      throw new XyoError(`Already searching for peers`, XyoErrors.CRITICAL)
    }

    this.processState = 'processing'
    this.processQueue()

    this.onPeerFound = onPeerFound

    if (this.dnsLookup) {
      dns.lookup(this.dnsLookup, { all: true }, (err, addresses) => {
        if (err) {
          this.logError(`Error looking up DNS record for ${this.dnsLookup}`, err)
          return
        }
        addresses.forEach(address => this.addCandidateToQueue(address.address))
      })
    }

    return () => {
      this.onPeerFound = undefined

      if (this.queueProcessTimeout) {
        clearTimeout(this.queueProcessTimeout)
        this.processState = 'should-stop-processing'
      } else {
        this.processState = 'not-processing'
      }
    }
  }

  private addCandidateToQueue(ip: string, port: number = this.defaultPort): boolean {
    const lookupKey = `${ip}:${port}`
    if (this.queueKeys[lookupKey]) {
      this.logInfo(`${lookupKey} is already in queue, will not add`)
      return false
    }

    if (this.blackList.networks[lookupKey]) {
      this.logInfo(`${lookupKey} is in blacklist. Will not add`)
      return false
    }

    this.logInfo(`Adding ${lookupKey} to Discovery queue`)
    this.queue.push({ ip, port })
    this.queueKeys[lookupKey] = true
    return true
  }

  private processQueue(queueInterval: number = this.MIN_QUEUE_WAIT) {
    this.queueProcessTimeout = setTimeout(async () => {
      this.logInfo(`Processing queue`)

      this.queueProcessTimeout = undefined
      if (this.queue.length > 0) {
        const item = this.queue.pop() as IXyoPeerCandidate
        this.vettedPeers.networks[`${item.ip}:${item.port}`] = true
        const potentialPeer = await this.getAboutForPeer(item.ip, item.port, this.me)
        if (potentialPeer && potentialPeer.peers) {
          this.logInfo(`Found peer at ${item.ip}:${item.port}. Peers has ${potentialPeer.peers.length} peers`)
          potentialPeer.peers.forEach((peerOfPeer) => {
            const added = this.addPeerCandidate({
              ip: peerOfPeer.ip,
              port: peerOfPeer.graphqlPort
            })
            this.logInfo(`
              ${added ? 'Added' : 'Failed to add'} ${peerOfPeer.ip}:${peerOfPeer.graphqlPort} to peer candidates
            `)
          })
        }

        if (
          potentialPeer &&
          this.onPeerFound &&
          this.processState === 'processing' &&
          this.potentialPeerIsNotBlackListed(potentialPeer)
        ) {
          const added = this.onPeerFound(potentialPeer)
          this.logInfo(`
            Peer with
              networkId: ${potentialPeer.ip}:${potentialPeer.graphqlPort}
              name: ${potentialPeer.name}
              address: ${potentialPeer.address}
            ${added ? 'Added' : 'Not added'}
          `)
        }
      }

      if (this.processState === 'processing') {
        let queueTime = Math.round(this.queue.length > 0 ? queueInterval / 2 : queueInterval * 2)
        queueTime = Math.min(queueTime, this.MAX_QUEUE_WAIT)
        queueTime = Math.max(queueTime, this.MIN_QUEUE_WAIT)
        setImmediate(() => {
          this.processQueue(queueTime)
        })
      } else if (this.processState === 'should-stop-processing') {
        this.logInfo(`Will stop processing the queue`)
        this.processState = 'not-processing'
      }
    }, queueInterval)
  }

  private potentialPeerIsNotBlackListed(potentialPeer: IXyoPeerDescription) {
    return !this.blackList.addresses[potentialPeer.address] &&
      !this.blackList.names[potentialPeer.name] &&
      !this.blackList.networks[`${potentialPeer.ip}:${potentialPeer.graphqlPort}`]
  }

  private getAboutForPeer(
    hostname: string,
    port: number,
    me?: IXyoPeerDescriptionWithPeers
  ): Promise<IXyoPeerDescriptionWithPeers | undefined> {
    const options: http.RequestOptions = {
      hostname,
      method: "POST",
      port: String(port),
      path: '',
      headers: {
        "Accept-Encoding": "gzip, deflate, br",
        "content-type": "application/json",
        accept: "application/json",
        "Cache-Control": "no-cache"
      }
    }

    return new Promise((resolve) => {
      try {
        const req = http.request(options, (res) => {
          const chunks: Buffer[] = []

          res.on("data", (chunk) => {
            chunks.push(chunk)
          })

          res.on('error', (err) => {
            this.logError(`There was an error getting about info for potential peer on response`, err)
            resolve(undefined)
          })

          res.on("end", () => {
            if (chunks.length === 0) {
              resolve(undefined)
              return
            }

            const body = Buffer.concat(chunks)

            if (res.statusCode !== 200) {
              this.logError(`There was an error resolving peer information`)
              return resolve(undefined)
            }

            try {
              const dataBlob = JSON.parse(body.toString())
              this.logInfo(XyoBase.stringify(dataBlob))
              if (
                typeof dataBlob === 'object' &&
                'data' in dataBlob &&
                typeof dataBlob.data === 'object' &&
                'about' in dataBlob.data &&
                typeof dataBlob.data.about === 'object' &&
                'name' in dataBlob.data.about &&
                'version' in dataBlob.data.about &&
                'ip' in dataBlob.data.about &&
                'graphqlPort' in dataBlob.data.about &&
                'nodePort' in dataBlob.data.about &&
                'address' in dataBlob.data.about &&
                typeof dataBlob.data.about.name === 'string' &&
                typeof dataBlob.data.about.version === 'string' &&
                typeof dataBlob.data.about.ip === 'string' &&
                typeof dataBlob.data.about.graphqlPort === 'number' &&
                typeof dataBlob.data.about.nodePort === 'number' &&
                typeof dataBlob.data.about.address === 'string'
              ) {
                const result: IXyoPeerDescriptionWithPeers = {
                  name: dataBlob.data.about.name,
                  version: dataBlob.data.about.version,
                  ip: dataBlob.data.about.ip,
                  graphqlPort: dataBlob.data.about.graphqlPort,
                  nodePort: dataBlob.data.about.nodePort,
                  address: dataBlob.data.about.address,
                  peers: []
                }

                if (dataBlob.data.about.peers instanceof Array) {
                  dataBlob.data.about.peers.forEach((peerCandidate: any) => {
                    if (
                      typeof peerCandidate.ip === 'string' &&
                      typeof peerCandidate.name === 'string' &&
                      typeof peerCandidate.version === 'string' &&
                      typeof peerCandidate.graphqlPort === 'number' &&
                      typeof peerCandidate.nodePort === 'number' &&
                      typeof peerCandidate.address === 'string'
                    ) {
                      result.peers = result.peers || []
                      result.peers.push({
                        ip: peerCandidate.ip as string,
                        name: peerCandidate.name,
                        version: peerCandidate.version,
                        graphqlPort: peerCandidate.graphqlPort,
                        nodePort: peerCandidate.nodePort,
                        address: peerCandidate.address
                      })
                    }
                  })
                }

                return resolve(result)
              }

              resolve(undefined)
            } catch (err) {
              this.logError(`Could not parse payload`, err)
              resolve(undefined)
            }
          })
        })

        req.on('error', (err) => {
          this.logError(`There was an error getting about info for potential peer on request`, err)
          resolve(undefined)
        })

        const aboutYou = me ? `{
          name: \\\"${me.name}\\\",
          version: \\\"${me.version}\\\",
          ip: \\\"${me.ip}\\\",
          graphqlPort: ${me.graphqlPort},
          nodePort: ${me.nodePort},
          address: \\\"${me.address}\\\",
          peers: ${this.aboutMeSerializer(me, true)}
        }` : 'null'

        // tslint:disable:max-line-length
        req.write(`
          {
            "operationName": null,
            "variables": {},
            "query": "{
              about(aboutYou: ${aboutYou}) {
                name,
                version,
                ip,
                graphqlPort,
                nodePort,
                address,
                peers {
                  name,
                  version,
                  ip,
                  graphqlPort,
                  nodePort,
                  address
                }
              }
            }"
          }`.split('\n').join('')
        )

        req.end()

        req.setTimeout(3000, () => {
          this.logInfo(`Connection probe timed out`)
          req.destroy()
          resolve(undefined)
        })
      } catch (err) {
        this.logError(`There was an error finding peers`, err)
        resolve(undefined)
      }
    }) as Promise<IXyoPeerDescriptionWithPeers | undefined>

  }

  private aboutMeSerializer(me: IXyoPeerDescription | IXyoPeerDescriptionWithPeers, withPeers: boolean) {
    let peersValue = '[]'
    if (withPeers && this.isPeerDescriptionWithPeers(me) && me.peers &&  me.peers.length) {
      peersValue = me.peers.map((p) => {
        return this.aboutMeSerializer(p, false)
      })
      .join(', ')
      peersValue = `[${peersValue}]`
    }

    return me ? `{
      name: \\\"${me.name}\\\",
      version: \\\"${me.version}\\\",
      ip: \\\"${me.ip}\\\",
      graphqlPort: ${me.graphqlPort},
      nodePort: ${me.nodePort},
      address: \\\"${me.address}\\\",
      peers: ${peersValue}
    }` : 'null'
  }

  private isPeerDescriptionWithPeers(
    peerDescription: IXyoPeerDescription | IXyoPeerDescriptionWithPeers
  ): peerDescription is IXyoPeerDescriptionWithPeers {
    return (peerDescription as IXyoPeerDescriptionWithPeers).peers instanceof Array
  }
}
