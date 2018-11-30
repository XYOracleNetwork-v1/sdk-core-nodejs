/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 4:21:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 29th November 2018 11:05:16 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness, XyoBaseBoundWitness, IXyoPayload, XyoBasePayload } from "@xyo-network/bound-witness"
import { IXyoDeserializer, parse, ParseQuery, IXyoSerializationService, IXyoSerializable, IXyoSerializableObject } from "@xyo-network/serialization"
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
      const signedPayload = pQuery.query([0])
      const unsignedPayload = pQuery.query([1])
      const signedPayloadValue = signedPayload.mapChildren((signedPayloadChild) => {
        return serializationService.deserialize(signedPayloadChild.readData(true))
      })

      const unsignedPayloadValue = unsignedPayload.mapChildren((unsignedPayloadChild) => {
        return serializationService.deserialize(unsignedPayloadChild.readData(true))
      })

      return new OnTheFlyPayload(signedPayloadValue, unsignedPayloadValue)
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

// tslint:disable-next-line:max-classes-per-file
class OnTheFlyPayload extends XyoBasePayload {

  constructor (
    public signedPayload: IXyoSerializableObject[],
    public unsignedPayload: IXyoSerializableObject[]
  ) {
    super()
  }
}
