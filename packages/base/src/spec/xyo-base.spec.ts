/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 19th November 2018 11:55:09 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 5:47:39 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '../xyo-base'

describe('XyoBase', () => {

  it('Should be able to access logger', () => {
    const example = new TestExample()
    TestExample.logger.info('hello world')

    example.info(`Log to info channel`)
    example.error(`Log to error channel`)
    example.warn(`Log to warn channel`)
  })
})

class TestExample extends XyoBase {
  public info(msg: string) {
    this.logInfo(msg)
  }

  public error(msg: string) {
    this.logError(msg)
  }

  public warn(msg: string) {
    this.logWarn(msg)
  }
}
