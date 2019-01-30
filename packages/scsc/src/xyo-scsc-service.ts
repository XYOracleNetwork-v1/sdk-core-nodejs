/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 21st December 2018 12:50:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-scsc-service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 21st December 2018 12:59:33 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSCSCService, ISCSCQuestion } from './@types'

export class XyoSCSCService implements IXyoSCSCService {

  public getNextQuestion(): Promise<ISCSCQuestion<any, any> | undefined> {
    throw new Error('Method not implemented.')
  }
}
