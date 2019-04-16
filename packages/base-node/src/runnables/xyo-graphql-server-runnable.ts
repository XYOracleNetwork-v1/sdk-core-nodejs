/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Monday, 4th March 2019 12:58:41 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-graphql-server-runnable.ts
 
 * @Last modified time: Wednesday, 13th March 2019 4:01:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from "@xyo-network/base"
import { IXyoRunnable, providerFn } from "@xyo-network/utils"
import { XyoGraphQLServer } from "@xyo-network/graphql-server"

export class XyoGraphQLServerRunnable extends XyoBase implements IXyoRunnable {

  public readonly type = "daemon"
  private graphqlServer: XyoGraphQLServer | undefined

  constructor(private readonly graphqlProvider: providerFn<XyoGraphQLServer>) {
    super()
  }

  public getSleepTime(): number {
    return 0 // doesn't sleep, its a server
  }

  public async initialize(): Promise<void> {
    this.logInfo(`Start Daemon`)
  }

  public async run(): Promise<void> {
    this.graphqlServer = await this.graphqlProvider()
    await this.graphqlServer.start()
  }

  public async stop(): Promise<void> {
    if (this.graphqlServer) {
      return this.graphqlServer.stop()
    }

    return
  }

}
