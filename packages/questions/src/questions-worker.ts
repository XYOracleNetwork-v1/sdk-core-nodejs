/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st December 2018 11:46:46 am
 * @Email:  developer@xyfindables.com
 * @Filename: questions-worker.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 29th January 2019 12:23:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { IQuestionsProvider, IQuestion, IQuestionType, IXyoHasIntersectedQuestion, IXyoQuestionService, IProofOfIntersection } from './@types'
import { IXyoNodeRunnerDelegate } from '@xyo-network/node-runner'

export class QuestionsWorker extends XyoBase implements IXyoNodeRunnerDelegate {

  constructor (
    private readonly questionsProvider: IQuestionsProvider,
    private readonly questionsService: IXyoQuestionService
  ) {
    super()
  }

  public async onStop(): Promise<void> {
    this.logInfo('Stopping question worker')
  }

  public async run() {
    const question = await this.questionsProvider.nextQuestion()
    return this.onQuestionProvided(question)
  }

  private async onQuestionProvided<Q, A>(question: IQuestion<Q, A>): Promise<void> {
    if (question.type === IQuestionType.DID_INTERSECT) {
      const coercedQuestion = (question as unknown) as IQuestion<IXyoHasIntersectedQuestion, IProofOfIntersection>
      const intersections = await this.questionsService.getIntersections(coercedQuestion.getQuestion())

      if (intersections.length > 0) {
        const proof = await this.questionsService.buildProofOfIntersection(coercedQuestion.getQuestion(), intersections)
        if (proof === undefined) {
          question.cantAnswer()
          return
        }

        coercedQuestion.answer(proof)
      }

      return
    }

    question.cantAnswer()
  }

}
