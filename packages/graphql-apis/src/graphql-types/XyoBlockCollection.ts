/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 9:53:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoBlockCollection.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoBlockCollection {
  publicKey: String!
  blocks: [XyoBlock!]!
  publicKeySet: [String!]!
}
`

export const dependsOnTypes = [`XyoBlock`]
