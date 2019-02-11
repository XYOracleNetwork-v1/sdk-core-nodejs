/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th February 2019 12:54:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 8th February 2019 1:52:19 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoProviderContainer {
  hasDependency(dep: string): boolean
  get<T>(dep: string): Promise<T>
  register<T>(dep: string, provider: IXyoProvider<T>): void
}

export interface IXyoProvider<T> {
  get(container: IXyoProviderContainer): Promise<T>
}
