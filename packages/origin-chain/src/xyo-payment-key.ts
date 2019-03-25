import { XyoBaseSerializable, IXyoDeserializer, IXyoSerializationService, IXyoSerializableObject } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'

export class XyoPaymentKey extends XyoBaseSerializable {
  public schemaObjectId: number = schema.paymentKey.id

  constructor(private paymentKey: Buffer) {
    super(schema)
  }

  public getReadableValue() {
    return this.getData()
  }

  public getData(): Buffer {
    return this.paymentKey
  }

}
