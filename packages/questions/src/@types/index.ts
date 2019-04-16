/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 21st December 2018 11:30:24 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 
 * @Last modified time: Thursday, 7th March 2019 1:55:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoHash } from '@xyo-network/hashing'
import { IXyoRequestResponseTransaction } from '@xyo-network/transaction-pool'

export interface IXyoAnswerProvider<Q, A> {
  resolve(question: Q): Promise<A>
}

export interface ITransactionIntersectionRequest {
  id: string,
  request: IIntersectionRequest
}

export interface IXyoIntersectionTransaction extends IXyoRequestResponseTransaction<
  ITransactionIntersectionRequest,
  IProofOfIntersectionAnswer,
  boolean
> {}

export interface IXyoQuestionService {
  buildProofOfIntersection(
    question: IXyoHasIntersectedQuestion,
    forHashes: IXyoHash[]
  ): Promise<IProofOfIntersection | undefined>
  getIntersections(question: IXyoHasIntersectedQuestion): Promise<IXyoHash[]>
}

export interface IRequestDocument<T> {
  xyoBounty: number,
  xyoPayOnDelivery: number,
  weiPayOnDelivery: number,
  beneficiary: string,
  type: 'intersection',
  data: T
}

export interface IXyoHasIntersectedQuestion {
  partyOne: string[],
  partyTwo: string[],
  markers: string[],
  direction: 'FORWARD' | 'BACKWARD' | null
}

export interface IIntersectionRequest extends IRequestDocument<IXyoHasIntersectedQuestion> {
  data: IXyoHasIntersectedQuestion
  getId?(): string
}

export enum IQuestionType {
  DID_INTERSECT
}

export interface IQuestion<Q extends any, A extends any> {
  type: IQuestionType
  getQuestion(): Q
}

export interface IQuestionsProvider {
  nextQuestion<Q, A>(): Promise<IQuestion<Q, A>>
}

export interface IProofOfIntersectionAnswer {
  /**
   * The hash of the block where the two parties intersected
   *
   * @type {string}
   * @memberof IProofOfIntersection
   */
  hash: string

  /**
   * A 2D array where the first list corresponds to itemA and the second list
   * corresponds to itemB. The elements in the array should constitute a list of
   * hashes constituting a proof-of-identity chain. This will be an empty list
   * if the party is not rolling publicKey
   *
   * @type {string[][]}
   * @memberof IProofOfIntersectionAnswer
   */
  proofOfIdentities: string[][]

  /**
   * A list of in-order transfers (oldest-to-newest) where the
   * the block was transferred one party to another.
   *
   * @type {string[]}
   * @memberof IProofOfIntersectionAnswer
   */
  transfers: IXyoBlockTransfer[]
}

export interface IXyoBlockTransfer {
  hash: string
  proofOfIdentityFrom: string[]
}

export interface IProofOfIntersection {
  question: IXyoHasIntersectedQuestion
  answer: IProofOfIntersectionAnswer
}
