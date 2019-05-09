/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st December 2018 3:33:58 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 8th March 2019 2:29:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import {
  IQuestionsProvider,
  IQuestionType,
  IQuestion,
  IRequestDocument,
  IIntersectionRequest,
  IProofOfIntersection,
} from '@xyo-network/questions'
import { IConsensusProvider } from '@xyo-network/consensus'
import { IXyoContentAddressableService } from '@xyo-network/content-addressable-service'

export class Web3QuestionService extends XyoBase implements IQuestionsProvider {
  private currentPage = 0
  private cachedQuestions = [] // TODO don't fetch page each time
  private readonly ignoreQuestions: { [questionId: string]: boolean } = {}
  
  constructor(
    private readonly consensusProvider: IConsensusProvider,
    private readonly contentService: IXyoContentAddressableService,
  ) {
    super()
  }

  public async nextQuestion(): Promise<IQuestion<any, any>> {
    return new Promise(async (resolve) => {
      const potentialQuestion = await this.tryGetQuestion()
      if (potentialQuestion) {
        return resolve(potentialQuestion)
      }
      this.logInfo("Going to timeout this question!")
      // Consider rejecting after a certain amount of time or using exponential back-off
      XyoBase.timeout(async () => {
        const result = await this.nextQuestion()
        resolve(result)
      }, 1000)
    }) as Promise<IQuestion<IIntersectionRequest, IProofOfIntersection>>
  }

  private async tryGetQuestion() {
    // This needs to be a lot more sophisticated than it currently is
    const nextPageQuestions = await this.consensusProvider.getNextUnhandledRequests(this.currentPage)

    const newQuestions = Object.keys(nextPageQuestions).filter(
      k => !this.ignoreQuestions[k],
    )
    if (newQuestions.length === 0 && Object.keys(nextPageQuestions).length > 0) {
      const pages = await this.consensusProvider.getQueryPageCount()
      this.currentPage = Math.min(this.currentPage + 1, pages)
      if (pages !== this.currentPage) {
        return this.tryGetQuestion()
      }
    }
    if (newQuestions.length === 0) return

    // Order keys by most xyo bounty, not sure this is the right way to order
    const questionId = newQuestions[0]

    try {
      this.logInfo(`Fetching next question ${questionId}`)
      const resolvedQuestionBuffer = await this.contentService.get(questionId)

      if (!resolvedQuestionBuffer) return
      const resolvedQuestion = JSON.parse(
        resolvedQuestionBuffer.toString(),
      ) as IRequestDocument<any>

      this.ignoreQuestions[questionId] = true

      if (
        resolvedQuestion === undefined ||
        resolvedQuestion.type !== 'intersection'
      ) {
        this.logError(
          'Resolved Question not parsed, or question is not an intersection, ignoring until feature supported',
          resolvedQuestion,
        )
        return
      }
      const result: IQuestion<IIntersectionRequest, IProofOfIntersection> = {
        type: IQuestionType.DID_INTERSECT,
        getQuestion: () => {
          return { ...resolvedQuestion, getId: () => questionId }
        },
      }

      return result
    } catch (e) {
      this.ignoreQuestions[questionId] = true
      this.logError('Bad request, ignoring request', questionId)
      return
    }
  }
}
