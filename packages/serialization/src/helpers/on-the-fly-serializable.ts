/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 5th December 2018 11:11:11 am
 * @Email:  developer@xyfindables.com
 * @Filename: on-the-fly-serializable.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 6th March 2019 4:42:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { XyoBaseSerializable } from "./base-serializable"
import { IXyoSerializableObject, IOnTheFlyGetDataOptions, IXyoObjectSchema } from "../@types"
import { XyoError, XyoErrors } from "@xyo-network/errors"

export class XyoOnTheFlySerializable extends XyoBaseSerializable {
  constructor (
    schema: IXyoObjectSchema,
    public readonly schemaObjectId: number,
    private readonly dataOptions: IOnTheFlyGetDataOptions,
    private readonly readableName: string,
    private readonly readableValue: any
  ) {
    super(schema)
  }

  public getReadableName(): string {
    return this.readableName
  }
  public getReadableValue() {
    return this.readableValue
  }

  public getData(): Buffer | IXyoSerializableObject | IXyoSerializableObject[] {
    // tslint:disable-next-line:no-unused-expression
    if (this.dataOptions.buffer) {
      return this.dataOptions.buffer
    }

    if (this.dataOptions.object) {
      return this.dataOptions.object
    }

    if (this.dataOptions.array) {
      return this.dataOptions.array
    }

    if (this.dataOptions.fn) {
      return this.dataOptions.fn()
    }

    throw new XyoError(`No option implemented for OnTheFlySerializable`)
  }

}
