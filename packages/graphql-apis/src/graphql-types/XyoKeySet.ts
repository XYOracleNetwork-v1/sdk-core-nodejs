/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 9:48:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoKeySet.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:46 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoKeySet {
  array: [XyoPublicKey!]
}
`

export const dependsOnTypes = [`XyoPublicKey`]
