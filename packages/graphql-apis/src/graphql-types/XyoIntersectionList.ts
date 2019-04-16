/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 9:44:10 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoIntersectionList.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:42 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoIntersectionList implements List {
  meta: ListMeta!
  items: [String!]!
}
`

export const dependsOnTypes = [`List`, `ListMeta`]
