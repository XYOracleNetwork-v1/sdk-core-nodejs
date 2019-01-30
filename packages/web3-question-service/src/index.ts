/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st December 2018 3:33:58 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 25th January 2019 2:01:23 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/base'
import { IQuestionsProvider, IQuestionType, IQuestion, IXyoHasIntersectedQuestion } from '@xyo-network/questions'
import { XyoWeb3Service } from '@xyo-network/web3-service'

export class Web3QuestionService extends XyoBase implements IQuestionsProvider {

  private static readonly INTERSECTION_CONTRACT_NAME = 'PayOnDelivery'

  private readonly alreadyFetchedQuestions: {[questionId: string ]: boolean } = {}

  constructor (private readonly web3Service: XyoWeb3Service) {
    super()
  }

  public async nextQuestion(): Promise<IQuestion<any, any>> {
    return new Promise(async (resolve) => {
      const potentialQuestion = await this.tryGetQuestion()
      if (potentialQuestion) {
        return resolve(potentialQuestion)
      }

      // Consider rejecting after a certain amount of time or using exponential back-off
      setTimeout(async () => {
        const result = await this.nextQuestion()
        resolve(result)
      }, 1000)
    }) as Promise<IQuestion<IXyoHasIntersectedQuestion, boolean>>
  }

  private async tryGetQuestion() {
    const contract = await this.web3Service.getContractByName(Web3QuestionService.INTERSECTION_CONTRACT_NAME)
    let question: ISCSCHasIntersectedQuestion

    try {
      question = await contract.methods.questions(0).call() as ISCSCHasIntersectedQuestion
      if (!question) {
        this.logInfo('No questions exist in smart contract')
        return
      }
    } catch (err) {
      this.logInfo('No questions exist in smart contract')
      return
    }

    if (this.alreadyFetchedQuestions[question.questionId]) {
      return
    }

    const formattedQuestion: IXyoHasIntersectedQuestion = {
      partyOne: [question.itemA],
      partyTwo: [question.itemB],
      markers: question.marker ? [question.marker] : [],
      direction: 'FORWARD'
    }

    const result: IQuestion<IXyoHasIntersectedQuestion, boolean>  = {
      type: IQuestionType.DID_INTERSECT,
      getQuestion: () => {
        return formattedQuestion
      },
      answer: (a) => {
        if (a !== true) { // tslint:disable-line
          return
        }

        const { gas, gasPrice } = this.getGasParameters(IQuestionType.DID_INTERSECT)

        contract.methods.payForDelivery(
          question.itemA,
          question.itemB,
          question.beneficiary
        )
        .send({ from: this.web3Service.currentUser, gas, gasPrice })
        .then((payForDeliveryResult: any) => {
          this.logInfo(`PayForDelivery Result: ${payForDeliveryResult}`)
        })
        .catch((err: any) => {
          this.logError('There was an error calling PayForDelivery', err)
          throw err
        })
      },
      cantAnswer: () =>  {
        this.logInfo('No answer provided')
      }
    }

    return result
  }

  private getGasParameters(questionType: IQuestionType) {
    // extracted for the purpose of adding some intelligence here at another point
    return {
      gas: 6721975,
      gasPrice: 2000000000
    }
  }

}

interface ISCSCHasIntersectedQuestion {
  itemA: string
  itemB: string
  marker: string
  questionId: number
  beneficiary: string
  buyer: string
}
