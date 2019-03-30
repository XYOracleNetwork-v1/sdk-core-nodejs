/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 26th November 2018 2:52:10 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-bound-witness.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 8th March 2019 12:07:16 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness, FetterOrWitness, IXyoKeySet, IXyoSignatureSet, IXyoBoundWitnessParty, IXyoFetter, IXyoWitness } from "./@types"
import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, ParseQuery, IXyoSerializableObject, IParseResult, XyoSerializationService } from '@xyo-network/serialization'
import { schema } from '@xyo-network/serialization-schema'
import { XyoBoundWitnessParty } from './xyo-bound-witness-party'
import { XyoFetter } from "./xyo-fetter"
import { XyoError } from "@xyo-network/errors"
import { XyoWitness } from "./xyo-witness"

export class XyoBoundWitness extends XyoBaseSerializable implements IXyoBoundWitness {

  public get publicKeys(): IXyoKeySet[] {
    return this.fetterWitnessPairs.map(fetterWitnessPair => fetterWitnessPair.fetter.keySet)
  }

  public get signatures(): IXyoSignatureSet[] {
    return this.fetterWitnessPairs.map(fetterWitnessPair => fetterWitnessPair.witness.signatureSet)
  }

  public get heuristics(): IXyoSerializableObject[][] {
    return this.fetterWitnessPairs.map(fetterWitnessPair => fetterWitnessPair.fetter.heuristics)
  }

  public get metadata(): IXyoSerializableObject[][] {
    return this.fetterWitnessPairs.map(fetterWitnessPair => fetterWitnessPair.witness.metadata)
  }

  public get numberOfParties(): number {
    return this.fetterWitnesses.reduce((memo, fw) => {
      return memo + ((fw.schemaObjectId === schema.fetter.id) ? 1 : 0)
    }, 0)
  }

  public get parties(): IXyoBoundWitnessParty[] {
    return this.fetterWitnessPairs.map((pair, index) => new XyoBoundWitnessParty(pair.fetter, pair.witness, index))
  }

  private get fetterWitnessPairs (): FetterWitnessPair[] {
    return getFetterWitnessPair(this.fetterWitnesses)
  }

  public static deserializer: IXyoDeserializer<IXyoBoundWitness>
  public readonly schemaObjectId = schema.boundWitness.id

  constructor(public readonly fetterWitnesses: FetterOrWitness[],
              private readonly respectSign?: Buffer) {

    super(schema)
  }

  public stripMetaData(): IXyoBoundWitness {
    return new XyoBoundWitness(this.fetterWitnesses.map((fw) => {
      if (fw.schemaObjectId === schema.fetter.id) return fw
      return new XyoWitness(
        (fw as IXyoWitness).signatureSet,
        []
      )
    }))
  }

  public getHeuristicFromParty<T extends IXyoSerializableObject>(
    partyIndex: number,
    schemaObjectId: number
  ): T | undefined {
    if (this.parties.length <= partyIndex) {
      throw new XyoError(`Insufficient number of parties to complete request`)
    }

    return this.parties[partyIndex].getHeuristic<T>(schemaObjectId)
  }

  public getMetaDataItemFromParty<T extends IXyoSerializableObject>(
    partyIndex: number,
    schemaObjectId: number
  ): T | undefined {
    if (this.parties.length <= partyIndex) {
      throw new XyoError(`Insufficient number of parties to complete request`)
    }

    return this.parties[partyIndex].getMetaDataItem<T>(schemaObjectId)
  }

  public getSigningData(): Buffer {
    return getSigningDataFromFetterWitnesses(this.fetterWitnesses)
  }

  public getData(): IXyoSerializableObject | IXyoSerializableObject[] | Buffer {
    return this.fetterWitnesses
  }

  public getReadableValue() {
    return {
      parties: this.publicKeys.map((publicKeySet, partyIndex) => {
        return {
          signing: publicKeySet.keys.map((key, keyIndex) => {
            return {
              publicKey: {
                type: key.getReadableName(),
                rawKey: key.getReadableValue()
              },
              signature: {
                type: this.signatures[partyIndex].signatures[keyIndex].getReadableName(),
                rawSignature: this.signatures[partyIndex].signatures[keyIndex].getReadableValue(),
              }
            }
          }),
          heuristics: this.heuristics[partyIndex].reduce((memo: {[s: string]: any}, heuristic) => {
            memo[heuristic.getReadableName()] = heuristic.getReadableValue()
            return memo
          }, {}),
          metadata: this.metadata[partyIndex].reduce((memo: {[s: string]: any}, metadata) => {
            memo[metadata.getReadableName()] = metadata.getReadableValue()
            return memo
          }, {}),
        }
      })
    }
  }
}

const getSigningDataFromFetterWitnesses = (fetterWitnessPairs: FetterOrWitness[]) => {
  const buffers: Buffer[] = []

  fetterWitnessPairs.forEach((hello) => {
    if (hello.schemaObjectId === XyoFetter.deserializer.schemaObjectId) {
      buffers.push(hello.serialize() as Buffer)
    }
  })

  return Buffer.concat(buffers)
}

const getFetterWitnessPair = (fetterOrWitnesses: FetterOrWitness[]) => {
  const result = fetterOrWitnesses.reduce((memo, fetterOrWitness, index) => {
    if (index < fetterOrWitnesses.length / 2) {
      memo.fetters.push(fetterOrWitness as IXyoFetter)
    } else {
      memo.witnesses.push(fetterOrWitness as IXyoWitness)
    }
    return memo
  },
    {
      fetters: [] as IXyoFetter[],
      witnesses: [] as IXyoWitness[]
    }
  )
  result.witnesses.reverse()
  return result.fetters.map((fetter, index) => new FetterWitnessPair(fetter, result.witnesses[index]))
}

// tslint:disable-next-line:max-classes-per-file
class XyoBoundWitnessDeserializer implements IXyoDeserializer<IXyoBoundWitness> {
  public schemaObjectId = schema.boundWitness.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoBoundWitness {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)

    const test = query.mapChildren(
      item => serializationService
      .deserialize(item.readData(true))
      .hydrate<IXyoFetter | IXyoWitness>()
    )

    return new XyoBoundWitness(
      query.mapChildren(
        item => serializationService
          .deserialize(item.readData(true))
          .hydrate<IXyoFetter | IXyoWitness>()
      ), data
    )
  }
}

XyoBoundWitness.deserializer = new XyoBoundWitnessDeserializer()

// tslint:disable-next-line:max-classes-per-file
class FetterWitnessPair {
  constructor (
    public readonly fetter: IXyoFetter,
    public readonly witness: IXyoWitness
  ) {}
}
