/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 12:00:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-archivist-network.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 3:55:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoArchivistNetwork } from './@types'
import { IXyoHash } from '@xyo-network/hashing'
import { XyoError, XyoErrors } from '@xyo-network/errors'
import { XyoBase } from '@xyo-network/base'
import { IXyoDivinerArchivistClientProvider, IXyoDivinerArchivistClient } from '@xyo-network/diviner-archivist-client'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoNodeNetwork, IXyoComponentFeatureResponse, IXyoComponentArchivistFeatureDetail } from '@xyo-network/node-network'
import { XyoDivinerArchivistGraphQLClient } from '@xyo-network/diviner-archivist-client.graphql'

export class XyoArchivistNetwork extends XyoBase implements IXyoArchivistNetwork, IXyoDivinerArchivistClientProvider {
  private timeout: NodeJS.Timeout | undefined

  private readonly peersIndex: IPeersIndex = { byType: { archivist: {}, diviner: {} }, byPublicKey: {} }

  private unsubscribeRequestFeatures: any | undefined

  constructor (
    private readonly serializationService: IXyoSerializationService,
    private readonly nodeNetwork: IXyoNodeNetwork
  ) {
    super()
  }

  public startFindingPeers() {
    this.refreshPeers()
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setInterval(this.refreshPeers.bind(this), 60000)
  }

  public stopVettingPeers() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = undefined
    }
  }

  public async getArchivistClients(max: number): Promise<IXyoDivinerArchivistClient[]> {
    // Pseudo randomly pick archivists from list
    const keyPool = Object.keys(this.peersIndex.byType.archivist)
    let chosenKeys = [] as string[]
    if (keyPool.length <= max) {
      chosenKeys = keyPool
    } else {
      while (chosenKeys.length < max) {
        const index = Math.floor(Math.random() * keyPool.length)
        chosenKeys.push(...(keyPool.splice(index, 1)))
      }
    }

    return chosenKeys.map((a) => {
      const res = this.peersIndex.byPublicKey[a]
      if (res.features.archivist) {
        const archivistOptions = res.features.archivist.featureOptions as IXyoComponentArchivistFeatureDetail
        return new XyoDivinerArchivistGraphQLClient(`${archivistOptions.graphqlHost}:${archivistOptions.graphqlPort}`)
      }

      return undefined
    })
    .filter(client => client) as XyoDivinerArchivistGraphQLClient[] // filter out uninitialized clients
  }

  public async getIntersections(
    partyOne: string[],
    partyTwo: string[],
    markers: string[],
    direction: 'FORWARD' | 'BACKWARD'
  ): Promise<IXyoHash[]> {
    const archivistClients = await this.getArchivistClients(5)

    const results = await Promise.all(
      archivistClients.map((client) => {
        return this.getPartiesIntersections(client, partyOne, partyTwo, markers, direction)
      })
    )

    const hashesByKey = results.reduce((memo: {[s: string]: IXyoHash}, hashes) => {
      hashes.forEach(hash => memo[hash.serializeHex()] = hash)
      return memo
    }, {})

    return Object.values(hashesByKey)
  }

  public async getPartiesIntersections(
    client: IXyoDivinerArchivistClient,
    partyOne: string[],
    partyTwo: string[],
    markers: string[],
    direction: 'FORWARD' | 'BACKWARD',
    cursor?: string
  ): Promise<IXyoHash[]> {
    if (
      !partyOne || partyOne.length !== 1 ||
      !partyTwo || partyTwo.length !== 1
    ) {
      throw new XyoError('Party length supports only 1 at this time', XyoErrors.CRITICAL)
    }

    if (markers && markers.length > 1) {
      throw new XyoError('Marker length support is at most 1 at this time', XyoErrors.CRITICAL)
    }

    this.logInfo(`
      IXyoHasIntersectedQuestion:
        Party One: ${partyOne[0]}
        Party Two: ${partyTwo[0]}
        Marker: ${markers && markers.length && markers[0]}`
    )

    const intersections = await client.getIntersections(
      partyOne[0],
      partyTwo[0],
      100,
      cursor
    )

    if (!intersections) {
      throw new XyoError('Could not retrieve intersection results', XyoErrors.CRITICAL)
    }

    if (intersections.items.length === 0) {
      return []
    }

    // '0' as a marker means no marker
    if (!markers || markers.length === 0 || markers[0] === '0') {
      return []
    }

    const marker = markers[0]
    const indexOfMarker = intersections.items.indexOf(marker)

    if (indexOfMarker !== -1) {
      if (direction === 'BACKWARD' || direction === 'FORWARD') {
        if (indexOfMarker === 0 && direction === 'BACKWARD') {
          return []
        }

        if (
          indexOfMarker === intersections.items.length - 1 &&
          !intersections.meta.hasNextPage &&
          direction === 'FORWARD'
        ) {
          return []
        }

        if (direction === 'BACKWARD') {
          intersections
            .items.slice(0, indexOfMarker) // everything before
            .map(strHash => this.serializationService.deserialize(strHash).hydrate())
        } else { // FORWARD
          intersections
            .items.slice(indexOfMarker + 1) // everything before
            .map(strHash => this.serializationService.deserialize(strHash).hydrate())
        }
      }

      return intersections.items.map(strHash => this.serializationService.deserialize(strHash).hydrate())
    }

    if (!intersections.meta.hasNextPage || !intersections.meta.endCursor) {
      return []
    }

    return this.getPartiesIntersections(client, partyOne, partyTwo, markers, direction, intersections.meta.endCursor)
  }

  public async getBlock(hash: IXyoHash): Promise<IXyoBoundWitness | undefined> {
    const archivistClients = await this.getArchivistClients(5)
    if (archivistClients.length === 0) {
      this.logInfo('Unable to get block from archivist network because no archivist clients are available')
      return undefined
    }

    // Set up a race to get a block by hash
    let resolved = false
    let returnCount = 0
    const hashHex = hash.serializeHex()

    return new Promise((resolve, reject) => {
      archivistClients.forEach(async (client) => {
        let result: string | undefined
        try {
          result = await client.getBlockBytesFromHash(hashHex)
        } catch (err) {
          // No reason to handle error, we have a redundancy of archivists
        } finally {
          returnCount += 1
        }

        try {
          if (result) {
            const bw = this.serializationService.deserialize(result).hydrate<IXyoBoundWitness>()
            if (!resolved) {
              resolved = true
              resolve(bw)
            }
          }
        } catch (err) {
          this.logError(`Unable to deserialize bound-witness with bytes ${result}`)
          // No reason to handle error, we have a redundancy of archivists
        } finally {
          if (returnCount === archivistClients.length && !resolved) {
            resolve(undefined)
          }
        }
      })
    })
  }

  private onComponentFeatureResponse(pk: string, msg: IXyoComponentFeatureResponse) {
    this.logInfo(`Received component feature response from ${pk}. Features: ${JSON.stringify(msg, null, 2)}`)

    try {
      this.peersIndex.byPublicKey[pk] = {
        lastTouch: new Date(),
        features: msg
      }

      if (msg.archivist && msg.archivist.supportsFeature)  {
        this.peersIndex.byType.archivist[pk] = true
      }

      if (msg.diviner && msg.diviner.supportsFeature)  {
        this.peersIndex.byType.diviner[pk] = true
      }

    } catch (err) {
      this.logError(`Issue parsing component-feature:response message from public key ${pk}`, err)
    }
  }

  private refreshPeers() {
    this.logInfo('Refreshing peers')
    if (this.unsubscribeRequestFeatures) this.unsubscribeRequestFeatures()
    // Prune peers first
    const currentTime = new Date()
    // There is surely a much better way of doing this, but this suffices
    if (currentTime.valueOf() % 3 === 0) { // 1 of 3 times Randomly choose when to prune
      const currentPeers = Object.keys(this.peersIndex.byPublicKey)
      currentPeers.forEach((pk) => {
        const lastTouch = this.peersIndex.byPublicKey[pk].lastTouch
        if ((currentTime.valueOf() - lastTouch.valueOf()) > 180000) {
          delete this.peersIndex.byPublicKey[pk]
          delete this.peersIndex.byType.archivist[pk]
          delete this.peersIndex.byType.diviner[pk]
        }
      })
    }

    // Now request features from network
    this.unsubscribeRequestFeatures = this.nodeNetwork.requestFeatures(this.onComponentFeatureResponse.bind(this))

  }
}

interface IPeersIndex {
  byType: {
    archivist: {
      [s: string]: boolean
    },
    diviner: {
      [s: string]: boolean
    }
  },
  byPublicKey: {
    [pk: string]: {
      lastTouch: Date
      features: IXyoComponentFeatureResponse
    }
  }
}
