/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 9:47:42 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoBlock.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:18 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoBlock {
  humanReadable: JSON!
  bytes: String!
  publicKeys: [XyoKeySet!]
  signatures: [XyoSignatureSet!]
  heuristics: [XyoHeuristicSet!]
  signedHash: String!
}
`

export const dependsOnTypes = [`XyoKeySet`, `XyoSignatureSet`, `XyoHeuristicSet`]
