/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 10:01:59 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoEntity.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:31 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoEntity {
  firstKnownPublicKey: String!
  allPublicKeys: [String!]!
  type: XyoEntityType!
  mostRecentIndex: Int!
}
`

export const dependsOnTypes = [`XyoEntityType`]
