/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts
 
 * @Last modified time: Wednesday, 13th March 2019 4:07:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

// tslint:disable:no-object-literal-type-assertion

// tslint:disable-next-line:no-reference
/// <reference path="./@types/merge.d.ts" />
import merge from 'merge'

import { IXyoNodeOptions } from "./@types"
import {
  LifeCycleRunner,
  IXyoProvider,
  depScope,
  ProcessManager
} from "@xyo-network/utils"
import { IResolvers } from "./xyo-resolvers-enum"
import { XyoNodeLifeCycle } from './xyo-node-lifecycle'

// tslint:disable-next-line:max-classes-per-file
export class XyoNode extends LifeCycleRunner {

  constructor (private readonly nodeOptions?: Partial<IXyoNodeOptions>) {
    super(new XyoNodeLifeCycle(nodeOptions))
  }

  public register<T, C>(dep: IResolvers, provider: IXyoProvider<T, C>, scope: depScope): void {
    return (this.lifeCyclable as XyoNodeLifeCycle).register<T, C>(dep, provider, scope)
  }

  public hasDependency(provider: IResolvers): boolean {
    return (this.lifeCyclable as XyoNodeLifeCycle).hasDependency(provider)
  }

  public async get<T>(provider: IResolvers, n: number): Promise<T> {
    return (this.lifeCyclable as XyoNodeLifeCycle).get<T>(provider)
  }
}