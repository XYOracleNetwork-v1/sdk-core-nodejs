export type IXyoTransactionType = 'withdraw' | 'question-answer' // extend when necessary

export interface IXyoTransaction<T> {
  transactionType: IXyoTransactionType,
  data: T
}

export interface IXyoTransactionRepository {
  shareTransaction(transaction: IXyoTransaction<any>): Promise<void>
  listenForTransactions(transaction: IXyoTransaction<any>): () => void

  // tslint:disable-next-line:prefer-array-literal
  getTransactions(): Promise<Array<IXyoTransaction<any>>>
}
