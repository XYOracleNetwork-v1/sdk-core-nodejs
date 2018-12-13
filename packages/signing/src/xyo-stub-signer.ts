/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 29th November 2018 4:40:40 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-stub-signer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 10:18:13 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSigner, IXyoPublicKey, IXyoSignature } from "./@types"
import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, ParseQuery } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'
export class XyoStubSigner extends XyoBaseSerializable implements IXyoSigner {

  public static deserializer: IXyoDeserializer<XyoStubSigner>
  public readonly schemaObjectId = schema.stubSigner.id

  constructor (
    public readonly publicKey: IXyoPublicKey,
    public readonly signature: IXyoSignature
  ) {
    super(schema)
  }

  get privateKey () {
    return 'abc'
  }

  public getReadableValue() {
    return this.privateKey
  }

  public getData() {
    return [
      this.publicKey,
      this.signature
    ]
  }

  public async signData(data: Buffer): Promise<IXyoSignature> {
    return this.signature
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoStubSignerDeserializer implements IXyoDeserializer<XyoStubSigner> {
  public readonly schemaObjectId = schema.stubSigner.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): XyoStubSigner {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)
    return new XyoStubSigner(
      serializationService.deserialize(query.getChildAt(0).readData(true)).hydrate<IXyoPublicKey>(),
      serializationService.deserialize(query.getChildAt(1).readData(true)).hydrate<IXyoSignature>()
    )
  }
}

XyoStubSigner.deserializer = new XyoStubSignerDeserializer()
