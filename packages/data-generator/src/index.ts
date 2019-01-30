/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 14th December 2018 4:26:55 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st December 2018 2:55:31 pm
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
import { rssiSerializationProvider } from '@xyo-network/heuristics-common'
import { IXyoHash, getHashingProvider } from '@xyo-network/hashing'
import { XyoIndex, XyoPreviousHash } from '@xyo-network/origin-chain'
import { createArchivistSqlRepository } from '@xyo-network/archivist-repository.sql'
import { serializer } from '@xyo-network/serializer'

const dataSet: IXyoInteraction[] = [
  {
    party1Id: 1,
    party2Id: 2,
    party1Heuristics: {
      rssi: -22
    },
    party2Heuristics: {
      rssi: -22
    }
  },
  {
    party1Id: 2,
    party2Id: 3,
    party1Heuristics: {
      rssi: -22
    },
    party2Heuristics: {
      rssi: -22
    }
  },
  {
    party1Id: 1,
    party2Id: 3,
    party1Heuristics: {
      rssi: -33
    },
    party2Heuristics: {
      rssi: -33
    }
  },
  {
    party1Id: 4,
    party2Id: 3,
    party1Heuristics: {
      rssi: -14
    },
    party2Heuristics: {
      rssi: -14
    }
  },
  {
    party1Id: 4,
    party2Id: 1,
    party1Heuristics: {
      rssi: -40
    },
    party2Heuristics: {
      rssi: -40
    }
  },
  {
    party1Id: 4,
    party2Id: 2,
    party1Heuristics: {
      rssi: -36
    },
    party2Heuristics: {
      rssi: -36
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
    const heuristics = tryBuildHeuristics({}, 0)
    const fetter = new XyoFetter(keySet, heuristics)
    const signingData = fetter.serialize()
    const signature = await entity.signer.signData(signingData)
    const witness = new XyoWitness(new XyoSignatureSet([signature]), [])
    const boundWitness = new XyoBoundWitness([fetter, witness])
    blocks.push(boundWitness)
    entity.index = (entity.index || 0) + 1
    const hash = await hashingProvider.createHash(signingData)
    entity.previousHash = hash

    entity.originChain = entity.originChain || []
    entity.originChain.push(boundWitness)
    return blocks
  }, Promise.resolve([]) as Promise<IXyoBoundWitness[]>)

  const boundWitnesses = await dataSet.reduce(async (interactionsPromise, interaction, index) => {
    const interactions = await interactionsPromise
    const serverEntity = entitiesById[interaction.party1Id]
    if (!serverEntity) {
      throw new XyoError(`Could not get signers for party index ${index}`, XyoErrors.CRITICAL)
    }

    const clientEntity = entitiesById[interaction.party2Id]
    if (!clientEntity) {
      throw new XyoError(`Could not get signers for party index ${index}`, XyoErrors.CRITICAL)
    }

    const serverKeySet = new XyoKeySet([serverEntity.signer.publicKey])
    const clientKeySet = new XyoKeySet([clientEntity.signer.publicKey])
    const serverHeuristics = tryBuildHeuristics(
      interaction.party1Heuristics,
      serverEntity.index || 0,
      serverEntity.previousHash
    )

    const clientHeuristics = tryBuildHeuristics(
      interaction.party2Heuristics,
      clientEntity.index || 0,
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

    interactions.push(boundWitness)
    serverEntity.index = (serverEntity.index || 0) + 1
    clientEntity.index = (clientEntity.index || 0) + 1
    const hash = await hashingProvider.createHash(signingData)
    serverEntity.previousHash = hash
    clientEntity.previousHash = hash

    serverEntity.originChain = serverEntity.originChain || []
    serverEntity.originChain.push(boundWitness)

    clientEntity.originChain = clientEntity.originChain || []
    clientEntity.originChain.push(boundWitness)
    return interactions
  }, Promise.resolve(genesisBlocks) as Promise<IXyoBoundWitness[]>)

  const repo = await createArchivistSqlRepository({
    host: args.host as string,
    user: args.user as string,
    password: args.password as string,
    database: args.database as string,
    port: args.port as number
  }, serializer)

  await boundWitnesses.reduce(async (memo, boundWitness) => {
    await memo
    const hash = await hashingProvider.createHash(boundWitness.getSigningData())
    return repo.addOriginBlock(hash, boundWitness)
  }, Promise.resolve())
}

function tryBuildHeuristics(
  heuristics: IXyoHeuristics,
  index: number,
  previousHash?: IXyoHash
): IXyoSerializableObject[] {
  const heuristicsCollection: IXyoSerializableObject[] = []
  heuristicsCollection.push(new XyoIndex(index))
  if (previousHash !== undefined) {
    heuristicsCollection.push(new XyoPreviousHash(previousHash))
  }

  return Object.keys(heuristics)
    .reduce((memo: IXyoSerializableObject[], key) => {
      const def = schema[key]
      const val = heuristics[key]
      if (def) {
        switch (def.id) {
          case schema.rssi.id:
            memo.push(rssiSerializationProvider.newInstance(val as number))
            return memo
        }
      }

      const serializable = new XyoKeyValueSerializable(key, val)
      memo.push(serializable)
      return memo
    }, heuristicsCollection)
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
