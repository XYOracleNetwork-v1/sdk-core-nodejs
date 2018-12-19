/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 19th December 2018 2:43:22 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 19th December 2018 2:54:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoMeta {
  totalCount: number
  endCursor: string | undefined
  hasNextPage: boolean
}

export interface IXyoMetaList<T> {
  meta: IXyoMeta,
  items: T[]
}

export class XyoMeta implements IXyoMeta {
  constructor (public totalCount: number, public endCursor: string | undefined, public hasNextPage = false) {}
}

// tslint:disable-next-line:max-classes-per-file
export class XyoMetaList<T> implements IXyoMetaList<T> {
  constructor (public readonly meta: IXyoMeta, public readonly items: T[]) {}
}
