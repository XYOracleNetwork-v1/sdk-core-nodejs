/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 28th January 2019 5:15:58 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 28th January 2019 5:30:24 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { unsubscribeFn } from '@xyo-network/p2p'

export interface IXyoNodeNetwork {

  /**
   * The features you will share with the network when requested
   *
   * @param {IXyoComponentFeatureResponse} features
   * @memberof IXyoNodeNetwork
   */
  setFeatures(features: IXyoComponentFeatureResponse): void

  /**
   * Request feature-set from nodes in the network
   *
   * @param {(publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void} callback
   * @returns {unsubscribeFn} A function that can be used to stop subscribing to responses
   * @memberof IXyoNodeNetwork
   */
  requestFeatures(callback: (publicKey: string, featureRequest: IXyoComponentFeatureResponse) => void): unsubscribeFn
}

export interface IXyoComponentArchivistFeatureDetail {
  graphqlHost: string
  graphqlPort: number
  boundWitnessHost: string
  boundWitnessPort: string
}

// tslint:disable-next-line:no-empty-interface
export interface IXyoComponentDivinerFeatureDetail {
}

export interface IXyoComponentFeatureResponse {
  archivist?: IXyoComponentFeatureDetail<IXyoComponentArchivistFeatureDetail>,
  diviner?: IXyoComponentFeatureDetail<IXyoComponentDivinerFeatureDetail>,
}

export interface IXyoComponentFeatureDetail<T extends {}> {
  featureType: string
  supportsFeature: boolean,
  featureOptions: T
}
