/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 20th December 2018 11:25:21 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st December 2018 3:50:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoSCSCDescription {
  address: string,
  platform: string,
  network: string,
  abi: string,
  bytecode: string,
  ipfs: string
}

export interface IXyoSCSCDescriptionProvider {
  resolve(): Promise<IXyoSCSCDescription>
}

export enum ISCSCQuestionType {
  HAS_INTERACTED
}

// tslint:disable-next-line:no-empty-interface
export interface IAnswerQuestionResult {
  // placeholder interface
}

export interface ISCSCQuestion<Q, A> {
  type: ISCSCQuestionType,
  question: Q,
  answerQuestion: (a: A) => Promise<IAnswerQuestionResult>
}

export interface IXyoSCSCService {
  getNextQuestion(): Promise<ISCSCQuestion<any, any> | undefined>
}
