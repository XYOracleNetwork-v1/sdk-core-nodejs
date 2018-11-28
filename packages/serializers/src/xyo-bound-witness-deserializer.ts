/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 4:21:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 28th November 2018 3:32:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness, XyoBaseBoundWitness, IXyoPayload } from "@xyo-network/bound-witness"
import { IXyoDeserializer, parse, ParseQuery, IXyoSerializationService } from "@xyo-network/serialization"
import { IXyoPublicKey, IXyoSignature } from "@xyo-network/signing"

export class XyoBoundWitnessDeserializer implements IXyoDeserializer<IXyoBoundWitness> {

  public schemaObjectId = XyoBaseBoundWitness.schemaObjectId

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoBoundWitness {
    const parseResult = parse(data)
    const query = new ParseQuery(parseResult)
    const publicKeysSets = query.query([0])
    const payloads = query.query([1])
    const signaturesSet = query.query([2])

    const publicKeysValue = publicKeysSets.mapChildren((pQuery) => {
      return pQuery.mapChildren(pkQuery => serializationService.deserialize<IXyoPublicKey>(pkQuery.readData(true)))
    })

    const payloadValue = payloads.mapChildren((pQuery) => {
      return serializationService.deserialize<IXyoPayload>(pQuery.readData(true))
    })

    const signaturesValue = signaturesSet.mapChildren((sQuery) => {
      return sQuery.mapChildren(sigQuery => serializationService.deserialize<IXyoSignature>(sigQuery.readData(true)))
    })

    return new OnTheFlyBoundWitness(publicKeysValue, signaturesValue, payloadValue)
  }
}

// tslint:disable-next-line:max-classes-per-file
class OnTheFlyBoundWitness extends XyoBaseBoundWitness {

  constructor (
    public publicKeys: IXyoPublicKey[][],
    public signatures: IXyoSignature[][],
    public payloads: IXyoPayload[]
  ) {
    super()
  }
}
