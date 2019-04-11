/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 10th December 2018 10:43:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-fetter.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 1:50:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoFetter, IXyoKeySet } from "./@types"
import { XyoBaseSerializable, IXyoSerializableObject, IXyoDeserializer, ParseQuery, IXyoSerializationService } from "@xyo-network/serialization"
import { schema } from '@xyo-network/serialization-schema'

export class XyoFetter extends XyoBaseSerializable  implements IXyoFetter {

  public static deserializer: IXyoDeserializer<IXyoFetter>

  public readonly schemaObjectId = schema.fetter.id

  public constructor (
    public keySet: IXyoKeySet,
    public heuristics: IXyoSerializableObject[],
    origin?: Buffer) {
    super(schema, origin)
  }

  public getData(): IXyoSerializableObject | IXyoSerializableObject[] | Buffer {
    return [
      this.keySet,
      ...this.heuristics
    ]
  }

  public getReadableValue() {
    return {
      keySet: this.keySet.getReadableValue(),
      heuristics: this.heuristics.map((h) => {
        return {
          name: h.getReadableName(),
          value: h.getReadableValue()
        }
      })
    }
  }
}

// tslint:disable-next-line:max-classes-per-file
class XyoFetterDeserializer implements IXyoDeserializer<IXyoFetter> {
  public readonly schemaObjectId = schema.fetter.id

  public deserialize(data: Buffer, serializationService: IXyoSerializationService): IXyoFetter {
    const parseResult = serializationService.parse(data)
    const query = new ParseQuery(parseResult)
    const keySetItem = query.getChildAt(0)
    const keySet = serializationService.deserialize(keySetItem.readData(true)).hydrate<IXyoKeySet>()
    const childrenCount = query.getChildrenCount()
    let childIndex = 1
    const heuristics: IXyoSerializableObject[] = []

    while (childIndex < childrenCount) {
      const heuristicChild = query.getChildAt(childIndex)
      const heuristic = serializationService.deserialize(heuristicChild.readData(true)).hydrate()
      heuristics.push(heuristic)
      childIndex += 1
    }

    return new XyoFetter(keySet, heuristics, data)
  }
}

XyoFetter.deserializer = new XyoFetterDeserializer()
