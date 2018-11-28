/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 27th November 2018 4:21:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-deserializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 27th November 2018 5:12:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoBoundWitness, XyoBaseBoundWitness, IXyoPayload } from "@xyo-network/bound-witness"
import { IXyoDeserializer } from "@xyo-network/serialization"
import { IXyoPublicKey, IXyoSignature } from "@xyo-network/signing"
import { readHeader, sliceItem } from "@xyo-network/object-schema"

export class XyoBoundWitnessDeserializer implements IXyoDeserializer<IXyoBoundWitness> {

  public schemaObjectId = XyoBaseBoundWitness.schemaObjectId

  public deserialize(data: Buffer): IXyoBoundWitness {
    let offset = 0
    const publicKeySchema = readHeader(data)
    const publicKeysData = sliceItem(data, offset, publicKeySchema)

    offset += publicKeysData.length

    const payloadsSchema = readHeader(data.slice(offset, data.length))
    const payloadsData = sliceItem(data, offset, payloadsSchema)

    offset += payloadsData.length
    const signaturesSchema = readHeader(data.slice(offset, data.length))
    const signaturesData = sliceItem(data, offset, signaturesSchema)

    return new BufferBoundWitness(
      // @ts-ignore
      publicKeysData,
      signaturesData,
      payloadsData
    )
  }
}

// tslint:disable-next-line:max-classes-per-file
class BufferBoundWitness extends XyoBaseBoundWitness {
  constructor (
    public publicKeys: IXyoPublicKey[][],
    public signatures: IXyoSignature[][],
    public payloads: IXyoPayload[]
  ) {
    super()
  }
}
