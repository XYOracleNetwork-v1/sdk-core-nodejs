import { unsubscribeFn } from '@xyo-network/utils'

export type IXyoTransactionType = 'withdraw' | 'question-answer' // extend when necessary

export interface IXyoTransaction<T> {
  transactionType: IXyoTransactionType,
  data: T
}

export interface IXyoTransactionRepository {
  shareTransaction(transaction: IXyoTransaction<any>): Promise<void>
  listenForTransactions(): unsubscribeFn

  // tslint:disable-next-line:prefer-array-literal
  getTransactions(): Promise<Array<IXyoTransaction<any>>>
}
