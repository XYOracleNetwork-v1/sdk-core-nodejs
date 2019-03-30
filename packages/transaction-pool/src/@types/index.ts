import { IXyoMetaList } from '@xyo-network/meta-list'

export type IXyoTransactionType = 'withdraw' | 'request-response' // extend when necessary

export interface IXyoTransaction<T> {
  transactionType: IXyoTransactionType,
  data: T
}

export interface IXyoRequestResponseTransaction<X, Y, Z> extends IXyoTransaction<IRequestResponse<X, Y, Z>> {
  transactionType: 'request-response',
  data: IRequestResponse<X, Y, Z>
}

export interface IRequestResponse<Request, Response, Answer> {
  request: Request,
  response: Response,
  answer: Answer
}

export interface IXyoTransactionMeta {
  isAvailable: boolean
  blockHash: string | null,
  blockNumber: number | null,
  blockOrder: number | null,
  supportingDataValidated: boolean
  type: IXyoTransactionType
}

// tslint:disable-next-line:max-line-length
export interface IXyoTransactionRepository {
  add(id: string, item: IXyoTransaction<any>): Promise<void>
  contains(id: string): Promise<boolean>
  find(id: string): Promise<IXyoTransaction<any> | undefined>
  list(limit: number, cursor: string | undefined): Promise<IXyoMetaList<IXyoTransaction<any>>>
}
