/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 4:26:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 13th March 2019 2:52:28 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  XyoBoundWitness,
  XyoKeySet,
  XyoFetter,
  XyoSignatureSet,
  XyoWitness,
  IXyoBoundWitness
} from '@xyo-network/bound-witness'

import { getSignerProvider } from '@xyo-network/signing.ecdsa'
import { XyoError, XyoErrors } from '@xyo-network/errors'

import yargs, { Arguments } from 'yargs'
import { IXyoSigner } from '@xyo-network/signing'
import { schema } from '@xyo-network/serialization-schema'
import { IXyoSerializableObject, XyoBaseSerializable } from '@xyo-network/serialization'
import { XyoGps, rssiSerializationProvider, XyoJSONBlob } from '@xyo-network/heuristics-common'
import { IXyoHash, getHashingProvider, XyoHash, IXyoHashProvider } from '@xyo-network/hashing'
import { XyoIndex, XyoPreviousHash, XyoBridgeHashSet } from '@xyo-network/origin-chain'
import { createArchivistSqlRepository } from '@xyo-network/archivist-repository-sql'
import { serializer } from '@xyo-network/serializer'

const dataSet: IXyoInteraction[] = [
  {
    party1Id: 1,
    party2Id: 2,
    party1Heuristics: {
      rssi: -22,
      bridgeHashSet: [
        '#0'
      ],
      gps: {
        latitude: 32.725626,
        longitude: -117.161774
      },
      jsonBlob: {
        hello: 'world'
      }
    },
    party2Heuristics: {
      rssi: -22,
      gps: {
        latitude: 32.725626,
        longitude: -117.161774
      }
    }
  },
  {
    party1Id: 2,
    party2Id: 3,
    party1Heuristics: {
      rssi: -22,
      bridgeHashSet: [
        '#4' // the one above
      ],
      gps: {
        latitude: 33.725626,
        longitude: -116.161774
      }
    },
    party2Heuristics: {
      rssi: -22,
      gps: {
        latitude: 33.725626,
        longitude: -116.161774
      }
    }
  },
  {
    party1Id: 1,
    party2Id: 3,
    party1Heuristics: {
      rssi: -33,
      gps: {
        latitude: 34.725626,
        longitude: -115.161774
      }
    },
    party2Heuristics: {
      rssi: -33,
      gps: {
        latitude: 34.725626,
        longitude: -115.161774
      }
    }
  },
  {
    party1Id: 4,
    party2Id: 3,
    party1Heuristics: {
      rssi: -14,
      gps: {
        latitude: 35.725626,
        longitude: -114.161774
      }
    },
    party2Heuristics: {
      rssi: -14,
      gps: {
        latitude: 35.725626,
        longitude: -114.161774
      }
    }
  },
  {
    party1Id: 4,
    party2Id: 1,
    party1Heuristics: {
      rssi: -40,
      gps: {
        latitude: 36.725626,
        longitude: -113.161774
      }
    },
    party2Heuristics: {
      rssi: -40,
      gps: {
        latitude: 36.725626,
        longitude: -113.161774
      }
    }
  },
  {
    party1Id: 4,
    party2Id: 2,
    party1Heuristics: {
      rssi: -36,
      gps: {
        latitude: 37.725626,
        longitude: -112.161774
      }
    },
    party2Heuristics: {
      rssi: -36,
      gps: {
        latitude: 37.725626,
        longitude: -112.161774
      }
    }
  }
]

async function main(args: Arguments<any>) {
  const entitiesById = createPublicKeys(dataSet)
  const hashingProvider = getHashingProvider('sha256')

  const genesisBlocks = await Object.keys(entitiesById).reduce(async (genesisBlocksPromise, id) => {
    const blocks = await genesisBlocksPromise
    const entity = entitiesById[id]
    const keySet = new XyoKeySet([entity.signer.publicKey])
    const heuristics = await tryBuildHeuristics({}, 0, { data: blocks })
    const fetter = new XyoFetter(keySet, heuristics)
    const signingData = fetter.serialize()
    const signature = await entity.signer.signData(signingData)
    const witness = new XyoWitness(new XyoSignatureSet([signature]), [])
    const boundWitness = new XyoBoundWitness([fetter, witness])
    entity.index = (entity.index || 0) + 1
    const hash = await hashingProvider.createHash(signingData)
    blocks.push({ boundWitness, hash })
    entity.previousHash = hash

    entity.originChain = entity.originChain || []
    entity.originChain.push(boundWitness)
    return blocks
  }, Promise.resolve([]) as Promise<IHashBoundWitnessPair[]>)

  const boundWitnesses = await dataSet.reduce(async (interactionsPromise, interaction, index) => {
    const interactions = await interactionsPromise
    const serverEntity = entitiesById[interaction.party1Id]
    if (!serverEntity) {
      throw new XyoError(`Could not get signers for party index ${index}`)
    }

    const clientEntity = entitiesById[interaction.party2Id]
    if (!clientEntity) {
      throw new XyoError(`Could not get signers for party index ${index}`)
    }

    const serverKeySet = new XyoKeySet([serverEntity.signer.publicKey])
    const clientKeySet = new XyoKeySet([clientEntity.signer.publicKey])
    const serverHeuristics = await tryBuildHeuristics(
      interaction.party1Heuristics,
      serverEntity.index || 0,
      { data: interactions },
      serverEntity.previousHash
    )

    const clientHeuristics = await tryBuildHeuristics(
      interaction.party2Heuristics,
      clientEntity.index || 0,
      { data: interactions },
      clientEntity.previousHash
    )
    const serverFetter = new XyoFetter(serverKeySet, serverHeuristics)
    const clientFetter = new XyoFetter(clientKeySet, clientHeuristics)
    const signingData = Buffer.concat([
      serverFetter.serialize(),
      clientFetter.serialize(),
    ])

    const serverSignature = await entitiesById[interaction.party1Id].signer.signData(signingData)
    const clientSignature = await entitiesById[interaction.party2Id].signer.signData(signingData)
    const serverWitness = new XyoWitness(new XyoSignatureSet([serverSignature]), [])
    const clientWitness = new XyoWitness(new XyoSignatureSet([clientSignature]), [])
    const boundWitness = new XyoBoundWitness([serverFetter, clientFetter, clientWitness, serverWitness])

    serverEntity.index = (serverEntity.index || 0) + 1
    clientEntity.index = (clientEntity.index || 0) + 1
    const hash = await hashingProvider.createHash(signingData)
    interactions.push({ boundWitness, hash })
    serverEntity.previousHash = hash
    clientEntity.previousHash = hash

    serverEntity.originChain = serverEntity.originChain || []
    serverEntity.originChain.push(boundWitness)

    clientEntity.originChain = clientEntity.originChain || []
    clientEntity.originChain.push(boundWitness)
    return interactions
  }, Promise.resolve(genesisBlocks))

  const repo = await createArchivistSqlRepository({
    name: 'MySql',
    platform: 'mysql',
    host: args.host as string,
    user: args.user as string,
    password: args.password as string,
    database: args.database as string,
    port: args.port as number
  }, serializer)

  await boundWitnesses.reduce(async (memo, data) => {
    await memo
    return repo.addOriginBlock(data.hash, data.boundWitness)
  }, Promise.resolve())

  console.log(`\nCreated ${Object.keys(entitiesById).length} key-pairs`)
  Object.keys(entitiesById).forEach((k) => {
    const signer = entitiesById[k].signer
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    console.log(`Public Key: ${signer.publicKey.serializeHex()}`)
    console.log(`Private Key: ${signer.privateKey}`)
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`)
  })
}

async function tryBuildHeuristics(
  heuristics: IXyoHeuristics,
  index: number,
  context: IHeuristicContext,
  previousHash?: IXyoHash
): Promise<IXyoSerializableObject[]> {
  const heuristicsCollection: IXyoSerializableObject[] = []
  heuristicsCollection.push(new XyoIndex(index))
  if (previousHash !== undefined) {
    heuristicsCollection.push(new XyoPreviousHash(previousHash))
  }

  return Object.keys(heuristics)
    .reduce(async (promiseChain: Promise<IXyoSerializableObject[]>, key) => {
      const memo = await promiseChain
      const def = schema[key]
      const val = heuristics[key]
      if (def) {
        switch (def.id) {
          case schema.rssi.id:
            memo.push(rssiSerializationProvider.newInstance(val as number))
            return memo
          case schema.gps.id:
            const gpsLoc = val as {latitude: number, longitude: number}
            memo.push(new XyoGps(gpsLoc.latitude, gpsLoc.longitude))
            return memo
          case schema.jsonBlob.id:
            const jsonPayload = JSON.stringify(val)
            memo.push(new XyoJSONBlob(jsonPayload))
            return memo
          case schema.bridgeHashSet.id:
            memo.push(new XyoBridgeHashSet(
              (val as string[]).map((s) => {
                if (s.startsWith('#')) { // its a reference to the index of the bound-witness
                  const ref = parseInt(s.split('#')[1], 10)
                  return context.data[ref].hash
                }

                return serializer.deserialize(s).hydrate<IXyoHash>()
              })
            ))
            return memo
        }
      }

      const serializable = new XyoKeyValueSerializable(key, val)
      memo.push(serializable)
      return memo
    }, Promise.resolve(heuristicsCollection))
}

function createPublicKeys(data: IXyoInteraction[]): IXyoEntityById {
  const uniqueKeyCounts = data.reduce((memo: {[s: string]: number}, item) => {
    memo[item.party1Id] = (memo[item.party1Id] || 0) + 1
    memo[item.party2Id] = (memo[item.party2Id] || 0) + 1
    return memo
  }, {})

  const signerProvider = getSignerProvider('secp256k1-sha256')
  return Object.keys(uniqueKeyCounts)
    .reduce((memo: {[s: string]: { signer: IXyoSigner}}, key) => {
      memo[key] = { signer: signerProvider.newInstance() }
      return memo
    }, {})
}

if (require.main === module) {
  main(yargs.argv)
}

interface IXyoEntityById {
  [s: string]: IEntity
}

interface IEntity {
  signer: IXyoSigner
  index?: number
  previousHash?: IXyoHash,
  originChain?: IXyoBoundWitness[]
}

interface IXyoHeuristics {[s: string]: any}

interface IXyoInteraction {
  party1Id: number
  party2Id: number
  party1Heuristics: IXyoHeuristics,
  party2Heuristics: IXyoHeuristics
}

class XyoKeyValueSerializable extends XyoBaseSerializable implements IXyoSerializableObject {

  public schemaObjectId = 0xFF

  constructor(private readonly readableName: string, private readonly readableValue: any) {
    super(schema)
  }

  public getReadableValue() {
    return {
      [this.readableName]: this.readableValue
    }
  }

  public getReadableName() {
    return this.readableName
  }

  public getData(): Buffer | IXyoSerializableObject | IXyoSerializableObject[] {
    const value = JSON.stringify(this.getReadableValue())
    return Buffer.from(value)
  }
}

interface IHeuristicContext {
  data: IHashBoundWitnessPair[]
}

interface IHashBoundWitnessPair {
  hash: IXyoHash,
  boundWitness: IXyoBoundWitness
}
