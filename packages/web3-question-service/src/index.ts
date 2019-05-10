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
import { IXyoStorageProvider } from '@xyo-network/storage';

export class Web3QuestionService extends XyoBase implements IQuestionsProvider {
  private static REQUEST_INDEX_KEY = "NUM_QUERIES_FROM_HEAD"
  private distFromHead = 0
  private onlyQueryRecent = false
  private cachedQuestions = [] // TODO don't fetch page each time
  private readonly ignoreQuestions: { [questionId: string]: boolean } = {}
  
  constructor(
    private readonly consensusProvider: IConsensusProvider,
    private readonly contentService: IXyoContentAddressableService,
    private readonly storageProvider: IXyoStorageProvider
  ) {
    super()
    storageProvider.read(Buffer.from(Web3QuestionService.REQUEST_INDEX_KEY)).then((buff) => {
      try {
        this.distFromHead = buff ? buff.readUInt32LE(0) : 0
      } catch (e) {
        this.logError(`Garbage for key, ${Web3QuestionService.REQUEST_INDEX_KEY}`)
      }
    })
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

  private async tryGetQuestion(): Promise<any> {
    // This needs to be a lot more sophisticated than it currently is
    const requestCount = await this.consensusProvider.getNumRequests()
    const reqIndex = requestCount  - 1
    const curIndex = reqIndex - this.distFromHead >= 0 ?
                    reqIndex - this.distFromHead : reqIndex
    const nextQuestion =
       await this.consensusProvider.getRequestByIndex(
         this.onlyQueryRecent ? 0 : curIndex)

    if (!nextQuestion) {
      return
    }

    if (!this.onlyQueryRecent) {
      this.distFromHead = this.distFromHead >= requestCount ? 0 : this.distFromHead + 1
      const buff = Buffer.alloc(32)
      buff.writeUInt32LE(this.distFromHead, 0)
      await this.storageProvider.write(Buffer.from(Web3QuestionService.REQUEST_INDEX_KEY), buff)
    }

    // Order keys by most xyo bounty, not sure this is the right way to order
    const questionId = nextQuestion.ipfsHash

    try {
      this.logInfo(`Fetching next question ${questionId}`)
      const resolvedQuestionBuffer = await this.contentService.get(questionId)

      if (!resolvedQuestionBuffer) return
      const resolvedQuestion = JSON.parse(
        resolvedQuestionBuffer.toString(),
      ) as IRequestDocument<any>


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
      this.logError('Bad request, ignoring request', questionId)
      return
    }
  }
}
