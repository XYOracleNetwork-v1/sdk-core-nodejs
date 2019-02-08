/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 7th February 2019 2:02:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base-handler.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 7th February 2019 2:08:14 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { XyoMessageParser } from "../parsers"
import { unsubscribeFn } from "@xyo-network/p2p"
import { IXyoSerializationService } from "@xyo-network/serialization"

export abstract class XyoBaseHandler extends XyoBase {

  protected readonly messageParser: XyoMessageParser
  private readonly unsubscribes: {[s: string]: unsubscribeFn } = {}

  constructor(protected readonly serializationService: IXyoSerializationService) {
    super()
    this.messageParser = new XyoMessageParser(serializationService)
  }

  public unsubscribeAll() {
    Object.values(this.unsubscribes).forEach(u => u())
  }

  public abstract initialize(): void

  protected addUnsubscribe(name: string, unsubscribe: unsubscribeFn) {
    this.unsubscribes[name] = unsubscribe
  }

  protected removeUnsubscribe(name: string) {
    delete this.unsubscribes[name]
  }

  protected unsubscribe(name: string) {
    if (this.unsubscribes[name]) {
      this.unsubscribes[name]()
    }
  }
}
