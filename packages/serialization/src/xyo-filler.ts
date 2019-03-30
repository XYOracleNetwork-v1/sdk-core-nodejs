
import { XyoBaseSerializable } from './helpers/base-serializable'
import { IXyoSerializableObject, IXyoObjectSchema } from './@types'
import { readHeader } from './helpers/readHeader'

// this class is used to fill types that we do not know
export class XyoFiller extends XyoBaseSerializable implements IXyoSerializableObject {
  public schemaObjectId: number

  constructor (schema: IXyoObjectSchema, bytes: Buffer) {
    super(schema, bytes)

    this.schemaObjectId = readHeader(bytes).id
  }

  public getData(): Buffer | IXyoSerializableObject {
    const header = readHeader(this.origin!)
    const sizeOfSize = header.sizeIdentifierSize!
    const buff = this.origin!.slice(2 + sizeOfSize, this.origin!.length)
    return  buff
  }

  public getReadableValue(): any {
    return "Unknown"
  }

}
