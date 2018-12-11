/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 3rd December 2018 11:51:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 3rd December 2018 12:41:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoPeerDescription {
  name: string
  version: string
  ip: string
  graphqlPort: number
  nodePort: number
  address: string
}

export interface IXyoPeerDescriptionWithPeers extends IXyoPeerDescription {
  peers?: IXyoPeerDescription[]
}

export interface IXyoPeerCandidate {
  ip: string
  port: number
}
